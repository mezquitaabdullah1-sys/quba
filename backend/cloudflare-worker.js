/**
 * ☁️ Quba Backend Proxy — Cloudflare Worker (v2.0.0 · hardened)
 *
 * Actúa como escudo entre la app y las APIs públicas:
 *   • MyMemory (1000 llamadas/día por IP) → cache KV 30 días
 *   • Lingva.ml (fallback) → cache KV 30 días
 *   • UmmahAPI (unofficial) → cache KV 7 días
 *   • Nominatim (1 rps) → cache KV 30 días
 *
 * Seguridad (ver SECURITY_AUDIT.md):
 *   • Rate limiting distribuido (KV, compartido entre todos los servidores):
 *       - /auth/*        → 5 intentos / 15 min → 429 Too Many Requests
 *       - resto de rutas → 100 req / min / IP  → 429 Too Many Requests
 *   • Validación estricta de query/URL params (schema allowlist) → 400 Bad Request
 *   • Límite de tamaño de payload: 1 MB JSON · 10 MB en /upload/* → 413
 *   • Errores sin internals; security headers; CORS estricto por Origin
 *
 * Endpoints:
 *   GET /translate?text=...&target=es   → { translated, provider }
 *   GET /duas/categories                → lista de categorías
 *   GET /duas/category/{id}             → duas de una categoría
 *   GET /geocode?lat=...&lng=...        → { city, country }
 *   GET /prayer-times?lat=..&lng=..&date=DD-MM-YYYY → espejo EXACTO de Muslim Pro
 *   GET /health                         → { ok, version, kv }
 */

import { checkRateLimit, rateLimitResponse } from './lib/rate-limit.js';
import { validate, ValidationError, SCHEMAS } from './lib/validate.js';

const VERSION = '2.1.0';

// ⚠️ Dominios permitidos (CORS). Añade tu dominio real de producción.
const ALLOWED_ORIGINS = [
  'https://quba.example.com',
  'http://localhost:8080',
  'http://localhost:3000',
];

const CORS_HEADERS = (origin) => ({
  // Solo se refleja el Origin si está en la allowlist; si no, no hay ACAO.
  ...(ALLOWED_ORIGINS.includes(origin)
    ? { 'Access-Control-Allow-Origin': origin }
    : {}),
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

const CSP_POLICY = "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; img-src 'self' data: blob: https:; media-src 'self' https: data: blob:; connect-src 'self' https://api.aladhan.com https://www.muslimpro.com https://html.duckduckgo.com https://api.alquran.cloud https://cdn.islamic.network https://api.mymemory.translated.net https://nominatim.openstreetmap.org https://ummahapi.com https://lingva.ml https://libretranslate.com https://libretranslate.de https://download.quranicaudio.com https://everyayah.com; object-src 'none'; base-uri 'self'; manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'";

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  // Despliegue por fases: primero Report-Only para detectar roturas, luego
  // cambiar a 'Content-Security-Policy' para forzar el bloqueo.
  'Content-Security-Policy-Report-Only': CSP_POLICY,
};

// ─── Rate limiting policies ───
const RATE_LIMITS = {
  AUTH: { limit: 5, windowSec: 15 * 60 },   // login: 5 intentos / 15 min
  GLOBAL: { limit: 100, windowSec: 60 },    // resto: 100 req / min
};

// ─── Límites de payload (anti-DoS) ───
const PAYLOAD_LIMITS = {
  JSON_BYTES: 1 * 1024 * 1024,    // 1 MB por defecto
  UPLOAD_BYTES: 10 * 1024 * 1024, // 10 MB para subidas
  UPLOAD_PREFIXES: ['/upload/'],
};

// TTLs de cache en segundos
const TTL = {
  TRANSLATE: 30 * 24 * 3600, // 30 días
  DUAS: 7 * 24 * 3600,       // 7 días
  GEOCODE: 30 * 24 * 3600,   // 30 días
  PRAYER: 6 * 3600,          // 6 h — página de ciudad de Muslim Pro (7 días/carga)
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = CORS_HEADERS(origin);

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // ── 1) Límite de tamaño de payload ──
    const maxBytes = PAYLOAD_LIMITS.UPLOAD_PREFIXES.some((p) => url.pathname.startsWith(p))
      ? PAYLOAD_LIMITS.UPLOAD_BYTES
      : PAYLOAD_LIMITS.JSON_BYTES;
    const declaredLen = Number(request.headers.get('Content-Length') || 0);
    if (Number.isFinite(declaredLen) && declaredLen > maxBytes) {
      return json({ error: 'payload_too_large', maxBytes }, 413, cors);
    }

    // ── 2) Rate limiting distribuido (KV) ──
    const ip = request.headers.get('CF-Connecting-IP') || 'anonymous';
    const isAuth = url.pathname.startsWith('/auth/');
    const policy = isAuth ? RATE_LIMITS.AUTH : RATE_LIMITS.GLOBAL;
    if (env.QUBA_KV) {
      const rl = await checkRateLimit(env.QUBA_KV, {
        bucket: `${isAuth ? 'auth' : 'global'}:${ip}`,
        ...policy,
      });
      if (!rl.allowed) return rateLimitResponse(rl, policy.limit, cors);
    }

    // ── 3) Routing + validación estricta ──
    try {
      let body;
      const params = Object.fromEntries(url.searchParams);
      switch (url.pathname) {
        case '/health':
          body = { ok: true, version: VERSION, kv: !!env.QUBA_KV };
          break;
        case '/translate':
          body = await handleTranslate(validate(SCHEMAS.translate, params), env, ctx);
          break;
        case '/duas/categories':
          body = await handleDuasCategories(env, ctx);
          break;
        case '/geocode':
          body = await handleGeocode(validate(SCHEMAS.geocode, params), env, ctx);
          break;
        case '/prayer-times':
          body = await handlePrayerTimes(validate(SCHEMAS.prayerTimes, params), env, ctx);
          break;
        default:
          if (url.pathname.startsWith('/duas/category/')) {
            const { id } = validate(SCHEMAS.duasCategory, {
              id: url.pathname.slice('/duas/category/'.length),
            });
            body = await handleDuasCategory(id, env, ctx);
          } else {
            // /auth/*: la app aún no expone login, pero el límite 5/15min ya aplica.
            return json({ error: 'not_found' }, 404, cors);
          }
      }
      return json(body, 200, cors);
    } catch (err) {
      if (err instanceof ValidationError) {
        return json({ error: 'bad_request', details: err.details }, 400, cors);
      }
      // No filtrar mensajes internos al cliente
      return json({ error: 'upstream_or_internal_error' }, 502, cors);
    }
  },
};

// ============ TRANSLATE ============
async function handleTranslate({ text, source, target }, env, ctx) {
  const key = `tr:${source}:${target}:${await hash(text)}`;
  if (env.QUBA_KV) {
    const cached = await env.QUBA_KV.get(key, 'json');
    if (cached) return { ...cached, cached: true };
  }

  // Cadena de fallback: MyMemory → Lingva → LibreTranslate
  let result = null;
  const providers = [
    () => tryMyMemory(text, source, target),
    () => tryLingva(text, source, target),
    () => tryLibreTranslate(text, source, target),
  ];
  for (const provider of providers) {
    try {
      result = await provider();
      if (result && result.translated) break;
    } catch (e) { /* try next */ }
  }
  if (!result) throw new Error('all_providers_failed');

  if (env.QUBA_KV) {
    ctx.waitUntil(env.QUBA_KV.put(key, JSON.stringify(result), { expirationTtl: TTL.TRANSLATE }));
  }
  return result;
}

async function tryMyMemory(text, source, target) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const res = await fetch(url, { cf: { cacheTtl: 3600 } });
  if (!res.ok) throw new Error('mymemory_' + res.status);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error('mymemory_bad_response');
  return { translated: data.responseData.translatedText, provider: 'mymemory' };
}

async function tryLingva(text, source, target) {
  const url = `https://lingva.ml/api/v1/${source}/${target}/${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('lingva_' + res.status);
  const data = await res.json();
  return { translated: data.translation, provider: 'lingva' };
}

async function tryLibreTranslate(text, source, target) {
  const res = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source, target, format: 'text' }),
  });
  if (!res.ok) throw new Error('libretranslate_' + res.status);
  const data = await res.json();
  return { translated: data.translatedText, provider: 'libretranslate' };
}

// ============ DU'AS (proxy con cache largo) ============
async function handleDuasCategories(env, ctx) {
  const key = 'duas:categories';
  if (env.QUBA_KV) {
    const cached = await env.QUBA_KV.get(key, 'json');
    if (cached) return { ...cached, cached: true };
  }
  const res = await fetch('https://ummahapi.com/api/duas/categories');
  if (!res.ok) throw new Error('duas_upstream_' + res.status);
  const data = await res.json();
  if (env.QUBA_KV) {
    ctx.waitUntil(env.QUBA_KV.put(key, JSON.stringify(data), { expirationTtl: TTL.DUAS }));
  }
  return data;
}

async function handleDuasCategory(cat, env, ctx) {
  const key = `duas:cat:${cat}`;
  if (env.QUBA_KV) {
    const cached = await env.QUBA_KV.get(key, 'json');
    if (cached) return { ...cached, cached: true };
  }
  const res = await fetch(`https://ummahapi.com/api/duas/category/${cat}`);
  if (!res.ok) throw new Error('duas_upstream_' + res.status);
  const data = await res.json();
  if (env.QUBA_KV) {
    ctx.waitUntil(env.QUBA_KV.put(key, JSON.stringify(data), { expirationTtl: TTL.DUAS }));
  }
  return data;
}

// ============ GEOCODE ============
async function handleGeocode({ lat, lng }, env, ctx) {
  const key = `geo:${lat.toFixed(2)}:${lng.toFixed(2)}`;
  if (env.QUBA_KV) {
    const cached = await env.QUBA_KV.get(key, 'json');
    if (cached) return { ...cached, cached: true };
  }
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`;
  const res = await fetch(url, { headers: { 'User-Agent': 'QubaApp/1.0 (contact@example.com)' } });
  if (!res.ok) throw new Error('geocode_' + res.status);
  const data = await res.json();
  const result = {
    city: data.address?.city || data.address?.town || data.address?.village || '',
    country: data.address?.country || '',
    countryCode: data.address?.country_code || '',
  };
  if (env.QUBA_KV) {
    ctx.waitUntil(env.QUBA_KV.put(key, JSON.stringify(result), { expirationTtl: TTL.GEOCODE }));
  }
  return result;
}

// ============ PRAYER TIMES — espejo exacto de Muslim Pro (v2.1) ============
// La app replica minuto a minuto los horarios de Muslim Pro: se extraen los
// datos PRE-CALCULADOS que Muslim Pro incrusta en la página pública de cada
// ciudad (convención por defecto MWL; EGYPTBIS p. ej. en Jordania). Al ser
// los mismos números que publica Muslim Pro, no hay diferencia de minutos.
async function handlePrayerTimes({ lat, lng, date }, env, ctx) {
  const target = date || utcToday(); // DD-MM-YYYY
  const slugKey = `mp:slug:${lat.toFixed(2)}:${lng.toFixed(2)}`;
  let slug = env.QUBA_KV ? await env.QUBA_KV.get(slugKey) : null;
  if (!slug) {
    slug = await resolveMpSlug(lat, lng);
    if (slug && env.QUBA_KV) {
      ctx.waitUntil(env.QUBA_KV.put(slugKey, slug, { expirationTtl: TTL.GEOCODE }));
    }
  }
  if (!slug) throw new Error('muslimpro_slug_not_found');

  const [dd, mm, yyyy] = target.split('-');
  const iso = `${yyyy}-${mm}-${dd}`;
  const dayKey = `mp:day:${slug}:${iso}`;
  if (env.QUBA_KV) {
    const cached = await env.QUBA_KV.get(dayKey, 'json');
    if (cached) return { ...cached, cached: true };
  }

  const res = await fetch(`https://www.muslimpro.com/${slug}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' },
  });
  if (!res.ok) throw new Error('muslimpro_' + res.status);
  const html = await res.text();
  const { days, convention } = parseMpPage(html);
  const dates = Object.keys(days).sort();
  if (!dates.length) throw new Error('muslimpro_parse_empty');
  const usedDate = days[iso] ? iso : dates[dates.length - 1]; // día más reciente publicado
  const timings = days[usedDate];

  const body = { timings, date: usedDate, slug, convention, source: 'muslimpro' };
  if (env.QUBA_KV) {
    // Cachear los 7 días que publica la página → offline idéntico a Muslim Pro
    for (const [d, t] of Object.entries(days)) {
      ctx.waitUntil(env.QUBA_KV.put(
        `mp:day:${slug}:${d}`,
        JSON.stringify({ timings: t, date: d, slug, convention, source: 'muslimpro' }),
        { expirationTtl: TTL.PRAYER }
      ));
    }
  }
  return body;
}

const MP_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// NOTA: regex INTENCIONADAMENTE idéntica a js/muslimpro-sync.js (_parsePage).
function parseMpPage(html) {
  const days = {};
  const re = /\{\\"date\\":\\"(\d{4}-\d{2}-\d{2})\\",\\"times\\":\[(.*?)\]/g;
  let m;
  while ((m = re.exec(html))) {
    const parts = m[2].match(/\\"([^\\"]*)\\"/g) || [];
    const t = parts.map((p) => p.replace(/\\"/g, ''));
    if (t.length >= 6) {
      const o = {};
      MP_NAMES.forEach((n, i) => { o[n] = to24h(t[i]); });
      days[m[1]] = o;
    }
  }
  const conv = (html.match(/default_convention_key\\":\\"([A-Z_]+)\\"/) || [])[1] || 'MWL';
  return { days, convention: conv };
}

function to24h(t) {
  const [h, m] = String(t).trim().split(':');
  return `${String(parseInt(h, 10)).padStart(2, '0')}:${String(parseInt(m || '0', 10)).padStart(2, '0')}`;
}

// coords → (Nominatim) ciudad/país → (DuckDuckGo) slug oficial de Muslim Pro.
async function resolveMpSlug(lat, lng) {
  try {
    const g = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`, {
      headers: { 'User-Agent': 'QubaApp/1.0 (contact@example.com)' },
    });
    if (!g.ok) return null;
    const a = (await g.json()).address || {};
    const city = a.city || a.town || a.village || a.county || '';
    if (!city) return null;
    const q = encodeURIComponent(`muslimpro prayer times ${city} ${a.country || ''}`);
    const r = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' },
    });
    if (!r.ok) return null;
    let html = await r.text();
    try { html = decodeURIComponent(html); } catch (_) { /* usar html crudo */ }
    const m = html.match(/muslimpro\.com\/((?:[a-z]{2}\/prayer-times\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/\d+)|(?:Prayer-times-[A-Za-z0-9-]+-\d+))/i);
    return m ? m[1] : null;
  } catch (_) { return null; }
}

function utcToday() {
  const d = new Date();
  return `${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getUTCFullYear()}`;
}

// ============ helpers ============
function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS, ...cors },
  });
}

async function hash(text) {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}
