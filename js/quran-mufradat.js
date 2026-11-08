// 📖 v1.0.171 — معاني المفردات في التفسير (العربية)
// البيانات محلية: data/mufradat_ar.js مولّدة من المدونة الصرفية للقرآن الكريم
// (Quranic Arabic Corpus — Kais Dukes, CC BY 3.0). لا شيء يُخترع هنا:
// لكل كلمة: المفردة (lemma) والجذر ونوع الكلمة كما في المدونة.
const MufradatService = {
  _type(t) {
    const m = { N: 'اسم', PN: 'علم', ADJ: 'صفة', V: 'فعل', P: 'حرف', PRON: 'ضمير',
      DET: 'أداة تعريف', CONJ: 'حرف عطف', PREP: 'حرف جر', NEG: 'أداة نفي',
      INTG: 'أداة استفهام', REL: 'اسم موصول', ADV: 'ظرف', PART: 'أداة', SUB: 'أداة شرط',
      ACC: 'أداة نصب', AMD: 'أداة استدراك', ANS: 'جواب', CIRC: 'ظرف', RET: 'أداة ردع',
      SUR: 'أداة استفهام', T: 'أداة' };
    return m[t] || '';
  },
  forAyah(s, a) {
    const all = window.MUFRADAT_AR;
    if (!all) return [];
    return all[s + ':' + a] || [];
  },
  panelHtml(s, a) {
    let rows = [];
    try { rows = this.forAyah(s, a); } catch (e) { rows = []; }
    if (!rows.length) return '';
    const chips = rows.map(r => {
      const w = String(r[0] || ''), lem = String(r[1] || ''), root = String(r[2] || ''), tp = this._type(String(r[3] || ''));
      const showLem = lem && lem !== w;
      return `<div class="mf-chip">
        <span class="mf-w">${escapeHtml(w)}</span>
        ${showLem ? `<span class="mf-l">${escapeHtml(lem)}</span>` : ''}
        ${root ? `<span class="mf-r">جذر: ${escapeHtml(root)}</span>` : ''}
        ${tp ? `<span class="mf-t">${tp}</span>` : ''}
      </div>`;
    }).join('');
    return `<div class="mf-wrap" dir="rtl">
      <div class="mf-head"><i class="fas fa-spell-check"></i> معاني المفردات</div>
      <div class="mf-grid">${chips}</div>
      <div class="mf-note">المفردات والجذور من المدونة الصرفية للقرآن الكريم (Quranic Arabic Corpus، CC BY 3.0). المعنى الإجمالي في التفسير أعلاه.</div>
    </div>`;
  },
};
