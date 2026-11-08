// 🌍 ترجمة صفحة إعدادات الويدجتس — v1.0.166
// الصفحة مكتوبة بالعربية في المصدر؛ هذا الملف يترجم نصوصها إلى الإسبانية
// والإنجليزية في مكانها (نصًّا وسمات) بمراقبة DOM، فيبقى المصدر عربيًّا واحدًا
// لا نسختين تتباعدان. لا يمسّ إلا العبارات المدرجة في القاموس أعلاه.
(function () {
  var DICT = {
    'ويدجتس الشاشة الرئيسية': ['Widgets de la pantalla de inicio', 'Home screen widgets'],
    'لون واحد ونمط واحد لكل الأدوات': ['Un color y un estilo para todos los widgets', 'One colour and one style for all widgets'],
    'رجوع': ['Volver', 'Back'],
    'شريط': ['Barra', 'Bar'],
    'مربّع': ['Cuadrado', 'Square'],
    'آية': ['Verso', 'Verse'],
    'خرز': ['Cuentas', 'Beads'],
    'معاينة تقريبية — الحجم على الجهاز يتبع حجم البطاقة': ['Vista aproximada — el tamaño real depende de la tarjeta', 'Approximate preview — real size follows the widget card'],
    'لون التصميم': ['Color del diseño', 'Design colour'],
    'الخلفية': ['Fondo', 'Background'],
    'تدرّج': ['Degradado', 'Gradient'],
    'لون واحد': ['Color plano', 'Solid colour'],
    'خامة المسبحة': ['Material del tasbih', 'Tasbih material'],
    'تخصّ ويدجت «المسبحة — خرز» فقط.': ['Solo afecta al widget «Tasbih — cuentas».', 'Only affects the “Tasbih — beads” widget.'],
    'أضف أداة': ['Añadir widget', 'Add a widget'],
    'كيف أضيف ويدجت؟': ['¿Cómo añado un widget?', 'How do I add a widget?'],
    'التغييرات تُطبَّق فورًا على كل أداة مثبَّتة': ['Los cambios se aplican al instante a todos los widgets', 'Changes apply instantly to every placed widget'],
    'تحديث الأدوات': ['Actualizar widgets', 'Refresh widgets'],
    'أدوات الصلاة': ['Herramientas de oración', 'Prayer tools'],
    'المسبحة': ['Tasbih', 'Tasbih'],
    'الذكر اليومي': ['Dhikr diario', 'Daily dhikr'],
    'أخرى': ['Otros', 'Other'],
    'الصلاة القادمة — شريط': ['Próxima oración — barra', 'Next prayer — bar'],
    'العدّ التنازلي وشريط التقدّم': ['Cuenta atrás y barra de progreso', 'Countdown and progress bar'],
    'الصلاة القادمة — مربّع': ['Próxima oración — cuadrado', 'Next prayer — square'],
    'مع التاريخ الهجري': ['Con fecha hijri', 'With Hijri date'],
    'الصلوات الخمس': ['Las cinco oraciones', 'The five prayers'],
    'مواقيت اليوم كاملة': ['Todos los horarios de hoy', 'All of today\'s times'],
    'بخلفية المسجد': ['Con fondo de mezquita', 'With mosque background'],
    'صورة مع طبقة تعتيم': ['Foto con capa oscura', 'Photo with a dim layer'],
    'المسبحة — شريط': ['Tasbih — barra', 'Tasbih — bar'],
    'المسبحة — مربّع': ['Tasbih — cuadrado', 'Tasbih — square'],
    'المسبحة — خرز': ['Tasbih — cuentas', 'Tasbih — beads'],
    'عدّاد وزرّا زيادة وإعادة': ['Contador con botones + y reinicio', 'Counter with + and reset'],
    'عدّاد كبير بأزرار مريحة': ['Contador grande y botones cómodos', 'Large counter, comfy buttons'],
    'خيط خرز حقيقي بالضغط على الخرزة': ['Hilo de cuentas real: toca una cuenta', 'A real bead string — tap a bead'],
    'آية اليوم': ['Verso del día', 'Verse of the day'],
    'آية متجدّدة كل يوم': ['Un verso nuevo cada día', 'A new verse each day'],
    'حديث اليوم': ['Hadiz del día', 'Hadith of the day'],
    'حديث متجدّد مع مصدره': ['Hadiz nuevo con su fuente', 'A new hadith with its source'],
    'دعاء اليوم': ['Dua del día', 'Dua of the day'],
    'دعاء متجدّد من أدعية التطبيق': ['Dua nueva del repertorio de la app', 'A new dua from the app'],
    'الراديو': ['Radio', 'Radio'],
    'يشغّل الراديو مباشرة': ['Reproduce la radio al instante', 'Plays the radio instantly'],
    'العدّ التنازلي لرمضان': ['Cuenta atrás para Ramadán', 'Countdown to Ramadan'],
    'الأيام المتبقية والتاريخ الهجري': ['Días restantes y fecha hijri', 'Days left and Hijri date'],
    'زمردي': ['Esmeralda', 'Emerald'],
    'ذهبي': ['Dorado', 'Gold'],
    'فيروزي': ['Turquesa', 'Teal'],
    'عنّابي': ['Granate', 'Maroon'],
    'كحلي': ['Azul marino', 'Navy'],
    'بنفسجي': ['Violeta', 'Plum'],
    'ليلي': ['Nocturno', 'Night'],
    'عاجي': ['Marfil', 'Cream'],
    'عنبر': ['Ámbar', 'Amber'],
    'زبدة': ['Caramelo', 'Butterscotch'],
    'كوكا': ['Coco', 'Kuka'],
    'صندل': ['Sándalo', 'Sandalwood'],
    'زيتون': ['Olivo', 'Olive wood'],
    'أبنوس': ['Ébano', 'Ebony'],
    'أونيكس': ['Ónix', 'Onyx'],
    'عقيق': ['Ágata', 'Agate'],
    'كرنيليان': ['Cornalina', 'Carnelian'],
    'فيروز': ['Turquesa', 'Turquoise'],
    'لازورد': ['Lapislázuli', 'Lapis'],
    'مرجان': ['Coral', 'Coral'],
    'يشم': ['Jade', 'Jade'],
    'هيماتايت': ['Hematita', 'Hematite'],
    'كريستال': ['Cristal', 'Crystal'],
    'لؤلؤ': ['Perla', 'Pearl'],
    'ذهب': ['Oro', 'Gold'],
    'فضة': ['Plata', 'Silver'],
    'رخام': ['Mármol', 'Marble'],
    'دائري': ['Redonda', 'Round'],
    'بيضاوي': ['Ovalada', 'Oval'],
    'برميلي': ['Barril', 'Barrel'],
    'قرصي': ['Disco', 'Disc'],
    'مضلّع': ['Facetada', 'Faceted'],
    'سداسي': ['Hexagonal', 'Hex'],
    'ثماني': ['Octogonal', 'Octagon'],
    'معيّن': ['Rombo', 'Diamond'],
    'مربّع الشكل': ['Cuadrada', 'Square'],
    'حلقي': ['Anillo', 'Ring'],
    'اضغط مطوّلًا': ['Mantén pulsado', 'Press and hold'],
    'على مكان فارغ في الشاشة الرئيسية.': ['en un espacio libre de la pantalla de inicio.', 'on an empty spot on the home screen.'],
    'اختر': ['Elige', 'Choose'],
    '«الأدوات» (Widgets) من القائمة التي تظهر.': ['«Widgets» en el menú que aparece.', '“Widgets” from the menu that appears.'],
    'ابحث عن': ['Busca', 'Find'],
    '«قُبا» في قائمة التطبيقات، ثم اضغط الأداة المطلوبة.': ['«Quba» en la lista de apps y toca el widget deseado.', '“Quba” in the app list, then tap the widget.'],
    'اسحبها': ['Arrástrala', 'Drag it'],
    'إلى مكانها — ويمكن تغيير حجمها بالضغط المطوّل ثم السحب من الحواف.': ['a su sitio — cambia su tamaño manteniendo pulsado y arrastrando los bordes.', 'into place — resize it by holding and dragging the edges.'],
    'أسرع طريقة: اضغط زر': ['Atajo: toca el botón', 'Shortcut: tap the'],
    'أمام أي أداة أعلاه — يفتح التطبيق نافذة التثبيت مباشرة (أندرويد ٨ وأحدث).': ['junto a cualquier widget para abrir el cuadro de instalación (Android 8+).', 'next to any widget to open the install dialog (Android 8+).'],
    'إن لم تظهر نافذة التثبيت: اضغط مطوّلًا على مكان فارغ في الشاشة الرئيسية ← الأدوات ← قُبا.': ['Si no aparece el cuadro de instalación: mantén pulsado un espacio libre ← Widgets ← Quba.', 'If the install dialog does not appear: hold an empty spot ← Widgets ← Quba.'],
    'إن ظهرت رسالة': ['Si aparece el mensaje', 'If you see the message'],
    'أعد تشغيل الهاتف ثم أعد المحاولة، وتأكّد أن عدد الأدوات على الشاشة لم يبلغ حدّ المشغّل.': ['reinicia el teléfono e inténtalo de nuevo; comprueba que no llegaste al límite de widgets del launcher.', 'restart the phone and try again; check that you have not hit the launcher\'s widget limit.'],
    'الأدوات تتحدّث تلقائيًا كل نصف ساعة، ومواقيت الصلاة كل دقيقة. بعد تغيير الألوان تُطبَّق فورًا.': ['Los widgets se actualizan cada media hora y los horarios de oración cada minuto. Tras cambiar los colores se aplican al instante.', 'Widgets refresh every half hour and prayer times every minute. Colour changes apply instantly.']
  };

  var orig = new WeakMap();

  function locale() {
    try {
      var l = (typeof currentLocale !== 'undefined' && currentLocale) ? currentLocale
        : (window.currentLocale || document.documentElement.getAttribute('lang') || 'ar');
      l = String(l || 'ar').slice(0, 2).toLowerCase();
      return (l === 'en' || l === 'es') ? l : 'ar';
    } catch (e) { return 'ar'; }
  }

  function pick(key) {
    var row = DICT[key];
    if (!row) return null;
    var lg = locale();
    if (lg === 'en') return row[1];
    if (lg === 'es') return row[0];
    return null;
  }

  function textNodes(root) {
    var out = [];
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('[data-no-i18n]')) return NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  }

  var ATTRS = ['title', 'aria-label', 'placeholder'];

  function apply(root) {
    if (!root) return;
    try {
      textNodes(root).forEach(function (n) {
        if (!orig.has(n)) orig.set(n, n.nodeValue);
        var raw = orig.get(n);
        var key = raw.trim();
        var v = pick(key);
        n.nodeValue = v ? raw.replace(key, v) : raw;
      });
      if (root.querySelectorAll) {
        root.querySelectorAll('[title],[aria-label],[placeholder]').forEach(function (el) {
          ATTRS.forEach(function (a) {
            var cur = el.getAttribute(a);
            if (!cur) return;
            var store = '__i18n_' + a;
            if (!el[store]) el[store] = cur;
            var base = el[store];
            var v = pick(base.trim());
            var next = v ? base.replace(base.trim(), v) : base;
            if (el.getAttribute(a) !== next) el.setAttribute(a, next);
          });
        });
      }
    } catch (e) { /* لا نُسقط الصفحة بسبب ترجمة */ }
  }

  function init() {
    apply(document.body);
    try {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === 'childList') {
            m.addedNodes.forEach(function (nd) {
              if (nd.nodeType === 1) apply(nd);
              else if (nd.nodeType === 3 && nd.parentNode) apply(nd.parentNode);
            });
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    // تغيير اللغة أثناء الوقوف على الصفحة: إعادة التطبيق عند أي نقرة
    document.addEventListener('click', function () { setTimeout(function () { apply(document.body); }, 60); }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.WidgetsI18n = { apply: apply };
})();
