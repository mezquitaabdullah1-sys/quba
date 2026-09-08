// 📖 Quran helpers: tashkeel removal, surah names normalization, search

const QuranHelpers = {
  /**
   * Remove Arabic diacritics (tashkeel/harakat) for easier search.
   * النَّاسِ → الناس
   * بِسْمِ → بسم
   */
  removeTashkeel(text) {
    if (!text) return '';
    return text
      // Remove harakat: fatha, kasra, damma, sukun, shadda, tanween, hamza variations
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
      // Normalize alef variants
      .replace(/[\u0622\u0623\u0625]/g, '\u0627') // آ أ إ → ا
      .replace(/\u0671/g, '\u0627') // ٱ → ا
      // Normalize yaa
      .replace(/\u0649/g, '\u064A') // ى → ي
      // Normalize taa marbouta
      .replace(/\u0629/g, '\u0647') // ة → ه (for search only)
      .trim();
  },

  /**
   * Normalize Arabic text for fuzzy search comparison.
   */
  normalizeForSearch(text) {
    return this.removeTashkeel(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  },

  /**
   * Check if a surah name (with or without tashkeel) matches a search query.
   */
  surahMatches(surah, query) {
    if (!query) return true;
    const q = this.normalizeForSearch(query);
    if (!q) return true;

    // Number match
    if (String(surah.number).startsWith(q)) return true;

    // Match against english name (case insensitive)
    if (surah.englishName?.toLowerCase().includes(q.toLowerCase())) return true;
    if (surah.englishNameTranslation?.toLowerCase().includes(q.toLowerCase())) return true;

    // v22: match against Spanish name (búsqueda en español: «caverna», «vaca»…)
    if (surah.spanishName?.toLowerCase().includes(q.toLowerCase())) return true;

    // Match against Arabic name (with tashkeel removed)
    const arabicNormalized = this.normalizeForSearch(surah.name);
    if (arabicNormalized.includes(q)) return true;

    return false;
  },

  /**
   * Strip Bismillah from the first ayah of a surah (all surahs except Al-Fatihah & At-Tawbah).
   * Used to avoid duplication when Bismillah is displayed at the top of the page.
   */
  stripBismillahFromFirstAyah(text) {
    if (!text) return text;
    // Diacritic-tolerant pattern: matches the Bismillah prefix in ANY orthography
    // (Uthmani ٱللَّهِ / Imla'i الله, with or without tashkeel, tatweel, superscript alef…)
    // Each base letter is followed by an optional run of combining marks.
    const D = '[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*'; // harakat + superscript alef + quranic marks + tatweel
    const A = '[\\u0627\\u0623\\u0625\\u0622\\u0671]';             // any alef variant (incl. alef wasla ٱ)
    const pat = new RegExp(
      '^\\s*' +
      'ب' + D + 'س' + D + 'م' + D + '\\s+' +                          // بسم
      A + D + 'ل' + D + 'ل' + D + 'ه' + D + '\\s+' +                   // الله / ٱللَّهِ
      A + D + 'ل' + D + 'ر' + D + 'ح' + D + 'م' + D + '[ن\\u0649]' + D + '\\s+' + // الرحمن / ٱلرَّحْمَـٰنِ
      A + D + 'ل' + D + 'ر' + D + 'ح' + D + '[ي\\u0649]' + D + 'م' + D + // الرحيم / ٱلرَّحِيمِ
      '[\\s،,.—–-]*',
      'u'
    );
    return text.replace(pat, '').trim();
  },

  /**
   * Check if surah should display standalone Bismillah at top
   * (all surahs except Al-Fatihah (1) where it's part of the surah,
   *  and At-Tawbah (9) which has no Bismillah)
   */
  shouldShowBismillah(surahNumber) {
    return surahNumber !== 1 && surahNumber !== 9;
  },

  /**
   * Nombre de la sura para mostrar (lista, cabecera de la sura, búsqueda,
   * gestor de audio, marcadores…) — cambia con el idioma de la app:
   *   • árabe   → nombre árabe oficial (بدون تنسيق: sin «سورة» ni tashkeel
   *               sobrante), tal como aparece en el Mushaf.
   *   • español → traducción propia de la app (los 114 nombres).
   *   • inglés  → nombre transliterado de la API (Al-Baqarah…).
   */
  surahDisplayName(surah) {
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    if (loc === 'ar') return this.cleanArabicSurahName(surah.name);
    if (loc === 'es' && surah.spanishName) return surah.spanishName;
    return surah.englishName || '';
  },

  /**
   * Significado del nombre según el idioma de la UI:
   *   • árabe   → nombre transliterado (p. ej. Al-Baqarah), útil junto al
   *               nombre árabe que ya se muestra por separado.
   *   • español → nombre en español · inglés → significado oficial en inglés.
   */
  surahMeaning(surah) {
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    if (loc === 'ar') return surah.englishName || '';
    if (loc === 'es' && surah.spanishName) return surah.spanishName;
    return surah.englishNameTranslation || '';
  },

  /**
   * Limpia el nombre árabe oficial de la API («سُورَةُ ٱلْفَاتِحَةِ» → «الفاتحة»):
   * quita la palabra «سورة» inicial y el tashkeel (estilo Mushaf).
   */
  cleanArabicSurahName(name) {
    if (!name) return '';
    // Solo quita marcas diacríticas (harakat, alef superíndice, marcas
    // coránicas, tatweel) SIN normalizar letras: la forma escrita (ة، ى، …)
    // debe conservarse intacta para mostrarla (a diferencia del buscador,
    // donde removeTashkeel sí normaliza ة→ه para emparejar búsquedas).
    let s = String(name)
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
      .replace(/\u0671/g, '\u0627'); // alef wasla ٱ → ا
    s = s.replace(/^\s*سورة\s+/, '');
    return s.trim();
  },
};
