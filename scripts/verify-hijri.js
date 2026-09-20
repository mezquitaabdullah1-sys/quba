#!/usr/bin/env node
// 🌙 Verificación del motor hijri (HijriCalc) — sin dependencias.
//   node scripts/verify-hijri.js         (o: npm run verify:hijri)
//
// Comprueba, contra el calendario Umm al-Qura de ICU y contra el calendario
// OFICIAL de la mezquita (data/calendar2026.js):
//   1. Motor Intl  == Umm al-Qura                          (2025-2038)
//   2. Tabla incrustada == Umm al-Qura  (Intl desactivado)  (2024-2038)
//   3. Los 365 días etiquetados del calendario oficial 2026 (ambas vías)
//   4. Ocasiones futuras: fecha gregoriana exacta (incl. Ramadán 1448 = 8 feb 2027)
//   5. formatMonth() no se salta meses el día 29-31
// Sale con código 1 si algo falla.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const RealDate = Date;

function makeCtx(fakeNow) {
  const ctx = { console, Intl, Math, JSON, Object, Array, String, Number, parseInt, Promise, Map, Set, currentLocale: 'en' };
  ctx.CONFIG = { API: {}, CACHE_TTL: 1 }; ctx.Storage = { get() { return null; }, set() {} }; ctx.navigator = { onLine: true };
  ctx.Date = fakeNow ? class extends RealDate { constructor(...a) { a.length ? super(...a) : super(fakeNow); } } : RealDate;
  vm.createContext(ctx);
  for (const f of ['js/api.js', 'js/hijri.js', 'pages/calendar.js']) vm.runInContext(read(f), ctx, { filename: f });
  ctx.get = n => vm.runInContext(n, ctx);
  return ctx;
}

const icu = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' });
const truth = t => { const o = {}; icu.formatToParts(new RealDate(t + 12 * 3600e3)).forEach(p => o[p.type] = p.value); return { day: +o.day, month: +o.month, year: +o.year.replace(/\D/g, '') }; };
const same = (a, b) => a.day === b.day && a.month === b.month && a.year === b.year;

let failures = 0;
const check = (name, bad, total) => { console.log(`${bad ? '✗' : '✓'} ${name}: ${total - bad}/${total}`); if (bad) failures++; };

const ctx = makeCtx(); const H = ctx.get('HijriCalc');
const DAY = 86400000, U = RealDate.UTC;

// 1 + 2
for (const [label, forceTable, from, to] of [['Intl == Umm al-Qura', false, U(2025, 5, 1), U(2038, 0, 1)], ['Tabla incrustada == Umm al-Qura', true, U(2024, 6, 7), U(2038, 1, 6)]]) {
  H._fmt = forceTable ? null : undefined; let bad = 0, n = 0;
  for (let t = from; t < to; t += DAY) { const d = new RealDate(t); const h = H.fromGregorian(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); n++; if (!same(h, truth(t)) || !h.exact) bad++; }
  check(label, bad, n);
}

// 3 — calendario oficial 2026
const map = {}; for (const m of read('data/calendar2026.js').matchAll(/"(\d{4}-\d\d-\d\d)": "([a-z_]+)"/g)) map[m[1]] = m[2];
const rule = { ramadan_start: h => h.month == 9 && h.day == 1, ramadan: h => h.month == 9, last_ten_ramadan: h => h.month == 9 && h.day >= 21, laylat_qadr: h => h.month == 9 && h.day == 27, eid_fitr: h => h.month == 10 && h.day == 1, six_shawwal: h => h.month == 10 && h.day >= 2 && h.day <= 7, ten_dhulhijjah: h => h.month == 12 && h.day <= 8, arafah: h => h.month == 12 && h.day == 9, eid_adha: h => h.month == 12 && h.day == 10, tashreeq: h => h.month == 12 && h.day >= 11 && h.day <= 13, hijri_new_year: h => h.month == 1 && h.day == 1, tasua: h => h.month == 1 && h.day == 9, ashura: h => h.month == 1 && h.day == 10, mawlid: h => h.month == 3 && h.day == 12, isra_miraj: h => h.month == 7 && h.day == 27, nisf_shaban: h => h.month == 8 && h.day == 15, white_days: h => h.day >= 13 && h.day <= 15, sacred_month: h => [1, 7, 11, 12].includes(h.month) };
for (const [label, forceTable] of [['Calendario oficial 2026 (Intl)', false], ['Calendario oficial 2026 (tabla)', true]]) {
  H._fmt = forceTable ? null : undefined; let bad = 0, n = 0;
  for (const [d, k] of Object.entries(map)) {
    const [y, m, dd] = d.split('-').map(Number); const dow = new RealDate(U(y, m - 1, dd, 12)).getUTCDay();
    if (k === 'friday') { n++; if (dow !== 5) bad++; continue; }
    if (!rule[k]) continue; n++; if (!rule[k](H.fromGregorian(y, m, dd))) bad++;
  }
  check(label, bad, n);
}
H._fmt = undefined;

// 4 — ocasiones exactas
const EXPECT = { ramadan_start: '2027-02-08', eid_fitr: '2027-03-09', arafah: '2027-05-15', isra_miraj: '2027-01-05', nisf_shaban: '2027-01-23' };
const c2 = makeCtx(new RealDate('2026-09-19T12:00:00').getTime());
const ev = c2.get('CalendarPage')._computeUpcomingEvents();
let bad = 0; const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
for (const [key, iso] of Object.entries(EXPECT)) {
  const e = ev.find(x => x.key === key); const [y, m, d] = iso.split('-').map(Number);
  const left = Math.round((U(y, m - 1, d) - U(2026, 8, 19)) / DAY);
  if (!e || e.daysLeft !== left) bad++;
}
check('Ocasiones exactas (desde 2026-09-19)', bad, Object.keys(EXPECT).length);

// 5 — formatMonth
let badFm = 0;
for (const off of [-1, 0, 1, 2]) {
  const c = makeCtx(new RealDate('2026-08-31T10:00:00').getTime()); const C = c.get('CalendarPage'); C.monthOffset = off;
  const d = C.formatMonth(); if (d.getFullYear() * 12 + d.getMonth() !== 2026 * 12 + 7 + off) badFm++;
}
check('formatMonth() el 31 ago no se salta meses', badFm, 4);

console.log(failures ? '\n❌ FALLÓ la verificación' : '\n✅ Todo correcto');
process.exit(failures ? 1 : 0);
