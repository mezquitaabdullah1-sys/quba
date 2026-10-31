// 🔘 ToggleFeedback — حركة + رسالة لكل مفتاح تفعيل في التطبيق:
//   مفعّل  → أخضر + رسالة «تم تفعيل: …» (شريط أخضر)
//   موقوف → أبيض + رسالة «تم إيقاف: …» (شريط أبيض)
// يعمل بمستمع واحد على document فيشمل كل المفاتيح (.toggle-switch و .settings-toggle)
// الحالية والمستقبلية. المفاتيح التي يعتمد تفعيلها على إذن/عملية غير متزامنة تحمل
// data-managed="1" وتعلن نتيجتها الفعلية بنفسها عبر ToggleFeedback.announce().
const ToggleFeedback = {
  _timer: null,

  _loc() {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
    return ['ar', 'es', 'en'].includes(l) ? l : 'ar';
  },

  _text(on, label) {
    const m = {
      ar: on ? 'تم تفعيل' : 'تم إيقاف',
      es: on ? 'Activado' : 'Desactivado',
      en: on ? 'Enabled' : 'Disabled',
    }[this._loc()];
    return label ? m + ': ' + label : m;
  },

  /** اسم الميزة من الصف المحيط بالمفتاح */
  labelFor(input) {
    try {
      const row = input.closest('.list-row');
      if (row) {
        const el = row.querySelector('.list-row-label');
        if (el && el.textContent.trim()) return el.textContent.trim();
      }
      const lbl = input.closest('label.settings-toggle');
      if (lbl) {
        const sp = lbl.querySelector('span:not(.toggle-slider)');
        if (sp && sp.textContent.trim()) return sp.textContent.replace(/^[^\p{L}\p{N}]+/u, '').trim();
      }
      return (input.getAttribute('aria-label') || '').trim();
    } catch (e) { return ''; }
  },

  /** الرسالة العائمة (on=true أخضر، on=false أبيض). note: نص مخصّص يستبدل النص الافتراضي. */
  announce(label, on, note) {
    let el = document.getElementById('tgl-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tgl-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    const text = note || this._text(on, label);
    el.className = 'tgl-toast ' + (on ? 'on' : 'off');
    el.innerHTML = '<i class="fas ' + (on ? 'fa-circle-check' : 'fa-circle-minus') + '"></i><span></span>';
    el.lastChild.textContent = text;
    // إعادة تشغيل حركة الدخول
    void el.offsetWidth;
    el.classList.add('show');
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => el.classList.remove('show'), 2200);
    try { if (navigator.vibrate) navigator.vibrate(on ? [16, 30, 16] : 12); } catch (e) {}
  },

  _pop(input) {
    const slider = input.parentElement && input.parentElement.querySelector('.toggle-slider');
    if (!slider) return;
    slider.classList.remove('tgl-pop');
    void slider.offsetWidth;
    slider.classList.add('tgl-pop');
  },

  init() {
    document.addEventListener('change', (e) => {
      const input = e.target;
      if (!input || input.type !== 'checkbox') return;
      if (!input.closest('.toggle-switch, .settings-toggle')) return;
      this._pop(input);
      if (input.dataset.managed === '1') return;   // يعلن بنفسه بعد اكتمال العملية
      this.announce(this.labelFor(input), input.checked);
    }, true);
  },
};

if (typeof window !== 'undefined') {
  window.ToggleFeedback = ToggleFeedback;
  ToggleFeedback.init();
}
