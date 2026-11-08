// v1.0.130 — مهام يومية صغيرة في الرئيسية: تظهر، تُنجَز، ثم تختفي.
// لا نافذة ولا إعدادات: بطاقة واحدة أسفل بطاقة الرأس، مهامها قابلة للعدّ
// (تسبيح/استغفار/صلاة على النبي) أو تفتح شاشة (آية/أذكار)، وتُصفَّر تلقائيًا
// مع بداية يوم جديد. تُخزَّن في localStorage.
const HomeTasks = {
  KEY: 'quba_home_tasks',

  TASKS: [
    { id: 'tasbih10',  goal: 10, icon: 'fa-circle-nodes',   open: () => Router.go('wisdom/tasbih'),
      ar: 'سبّح ١٠ مرات', es: 'Di «Subhanallah» 10 veces', en: 'Say SubhanAllah 10×' },
    { id: 'istighfar', goal: 10, icon: 'fa-hands-praying',  open: () => Router.go('wisdom/tasbih'),
      ar: 'استغفر ١٠ مرات', es: 'Pide perdón 10 veces', en: 'Seek forgiveness 10×' },
    { id: 'salawat',   goal: 10, icon: 'fa-rose',           open: () => Router.go('wisdom/tasbih'),
      ar: 'صلِّ على النبي ١٠ مرات', es: 'Salawat al Profeta 10×', en: 'Salawat 10×' },
    { id: 'ayah',      goal: 1,  icon: 'fa-book-quran',     open: () => Router.go('quran'), nav: true,
      ar: 'اقرأ آية من القرآن', es: 'Lee un versículo', en: 'Read one verse' },
    { id: 'adhkar',    goal: 1,  icon: 'fa-sun',            open: () => Router.go('wisdom/adhkar'), nav: true,
      ar: 'أذكار الصباح أو المساء', es: 'Adhkar de mañana o tarde', en: 'Morning or evening adhkar' },
  ],

  _loc() {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
    return ['ar', 'es', 'en'].includes(l) ? l : 'ar';
  },
  _L(ar, es, en) { const l = this._loc(); return l === 'es' ? es : (l === 'en' ? en : ar); },
  _today() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },

  _state() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) {}
    if (!s || s.date !== this._today()) s = { date: this._today(), counts: {}, done: [] };
    return s;
  },
  _save(s) { try { localStorage.setItem(this.KEY, JSON.stringify(s)); } catch (e) {} },

  _vibrate() { try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {} },

  _left() {
    const s = this._state();
    return this.TASKS.filter(t => s.done.indexOf(t.id) === -1);
  },

  tap(id) {
    const task = this.TASKS.find(t => t.id === id);
    if (!task) return;
    const s = this._state();
    if (s.done.indexOf(id) !== -1) return;

    if (task.nav) {
      if (s.done.indexOf(id) === -1) s.done.push(id);
      this._save(s); this._vibrate();
      let gained = 0;
      if (typeof Gamification !== 'undefined' && Gamification.awardOnce) {
        gained = Gamification.awardOnce('home_task', id, Gamification.XP_PER_DAILY_TASK || 15);
        if (s.done.length >= this.TASKS.length) {
          gained += Gamification.awardOnce('home_task', '__all__', Gamification.XP_BONUS_ALL_TASKS || 25);
        }
      }
      this.render();
      if (gained && typeof showToast === 'function') showToast('✔ +' + gained + ' XP', 1700);
      try { task.open(); } catch (e) {}
      return;
    }
    s.counts[id] = (s.counts[id] || 0) + 1;
    const doneNow = s.counts[id] >= task.goal;
    if (doneNow && s.done.indexOf(id) === -1) s.done.push(id);
    this._save(s);
    this._vibrate();
    let gained = 0;
    if (doneNow && typeof Gamification !== 'undefined' && Gamification.awardOnce) {
      gained = Gamification.awardOnce('home_task', id, Gamification.XP_PER_DAILY_TASK || 15);
      if (s.done.length >= this.TASKS.length) {
        gained += Gamification.awardOnce('home_task', '__all__', Gamification.XP_BONUS_ALL_TASKS || 25);
      }
    }
    this.render();
    if (doneNow && typeof showToast === 'function') {
      showToast('✔ ' + this._L('أحسنت', '¡Bien!', 'Well done') + (gained ? ' · +' + gained + ' XP' : ''), 1800);
    }
  },

  _html() {
    const s = this._state();
    const left = this._left();
    const total = this.TASKS.length;
    const doneN = total - left.length;
    // v1.0.136: عند إتمام كل المهام تختفي البطاقة تمامًا من الصفحة
    if (!left.length) return '';
    const pctAll = Math.round((doneN / total) * 100);
    const rows = left.map(t => {
      const c = s.counts[t.id] || 0;
      const pct = t.goal > 1 ? Math.round((c / t.goal) * 100) : 0;
      return `<button class="ht-row" onclick="HomeTasks.tap('${t.id}')" aria-label="${escapeAttr ? escapeAttr(t[this._loc()]) : t[this._loc()]}">
        <span class="ht-ic"><i class="fas ${t.icon}"></i></span>
        <span class="ht-txt"><b>${t[this._loc()]}</b><em>${t.goal > 1 ? c + ' / ' + t.goal : this._L('اضغط عند الإتمام', 'Toca al terminar', 'Tap when done')}</em>
          ${t.goal > 1 ? `<span class="ht-bar"><span style="width:${pct}%"></span></span>` : ''}
        </span>
        <span class="ht-cbox"><i class="fas fa-check"></i></span>
      </button>`;
    }).join('');
    return `<div class="ht-card" id="home-tasks-card">
      <div class="ht-head">
        <span class="ht-t"><i class="fas fa-list-check"></i> ${this._L('مهام اليوم', 'Tareas de hoy', "Today's tasks")}</span>
        <span class="ht-count"><span class="ht-ring" style="--p:${pctAll}"></span>${doneN}/${total}</span>
      </div>
      <div class="ht-rows">${rows}</div>
    </div>`;
  },

  render() {
    const host = document.getElementById('main-content');
    if (!host) return;
    if (typeof Router === 'undefined' || !Router.current || Router.current.name !== 'home') {
      const old = document.getElementById('home-tasks-card');
      if (old) old.remove();
      return;
    }
    const card = document.getElementById('home-tasks-card');
    const html = this._html();
    if (card) { if (html) card.outerHTML = html; else card.remove(); return; }
    if (!html) return;
    const hero = document.getElementById('home-hero');
    if (!hero) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const el = wrap.firstElementChild;
    hero.insertAdjacentElement('afterend', el);
  },

  ensure() { try { this.render(); } catch (e) {} },
};

if (typeof window !== 'undefined') window.HomeTasks = HomeTasks;

// يُعاد الرسم عند كل تنقّل/تحديث للرئيسية
(function () {
  let t = null;
  const later = () => { clearTimeout(t); t = setTimeout(() => HomeTasks.ensure(), 140); };
  try { new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  if (document.readyState !== 'loading') setTimeout(later, 400);
  else document.addEventListener('DOMContentLoaded', () => setTimeout(later, 400));
})();
