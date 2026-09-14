// 📜 Orden de revelación de las 114 azoras (ترتيب نزول السور)
// El índice del array es el número de la azora (1-114); el valor es su
// número en el orden de revelación (número de revelación).
// Orden clásico según la cronología tradicional (Ibn Abbas / Al-Azhar).
const SURAHS_BY_REVELATION = [
  96, 68, 73, 74, 1, 111, 81, 87, 92, 89, 93, 94, 103, 100, 108,
  102, 107, 109, 105, 113, 114, 112, 53, 80, 97, 91, 85, 95, 106,
  101, 75, 104, 77, 50, 90, 86, 54, 38, 7, 72, 36, 25, 35, 19, 20,
  56, 26, 27, 28, 17, 10, 11, 12, 15, 6, 37, 31, 34, 39, 40, 41,
  42, 43, 44, 45, 46, 51, 88, 18, 16, 71, 14, 21, 23, 32, 52, 67,
  69, 70, 78, 79, 82, 84, 30, 29, 83, 2, 8, 3, 33, 60, 4, 99, 57,
  47, 13, 55, 76, 65, 98, 59, 24, 22, 63, 58, 49, 66, 64, 61, 62,
  48, 5, 9, 110,
];

// revelationOrderOf(surahNumber) -> 1..114 (número de revelación)
window.SURAH_REVELATION_ORDER = SURAHS_BY_REVELATION.reduce((acc, surahNum, idx) => {
  acc[surahNum] = idx + 1;
  return acc;
}, {});
