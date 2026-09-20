# Quba Changelog

## v1.0.63 — 2026-09-20 · إعادة ترتيب وتصميم الصفحة الرئيسية

- **حديث اليوم**: نُقل أسفل «مقتطفات دينية» مباشرة، وصار بطاقة بنمط «دعاء اليوم» (`card dua-day-card hadith-day-card`).
- **أسفل الصفحة**: العد التنازلي لرمضان ← يوم الصيام القادم ← المناسبة القادمة (داخل `.home-bottom-cards`).
- **العد التنازلي لرمضان**: خلفية بيج بألوان التطبيق في كل الثيمات + ألوان أرقام داكنة مقروءة (`css/main.css`).
- **أعلى الصفحة**: لم يبقَ سوى شريط «أكمل القراءة» (يظهر عند وجود قراءة سابقة).
- **أيقونتا الكورسات والتسبيح**: حُذفت الخلفية السوداء المدمجة في الصورتين (PNG شفاف 512px).
- رفع الإصدار إلى 1.0.63 لتجديد كاش الـ Service Worker.

## v1.0.61 — 2026-09-20 · السبب الحقيقي لـ«إعادة تحميل الرئيسية كل مرة» + جاهزية فورية بعد الجولة التعريفية

### 🐢 السبب الجذري الأول — أوقات الصلاة لم تكن تستفيد من الكاش أبداً تقريباً
- في `API.getPrayerTimes` (js/api.js)، فقط الكاش القادم من مزامنة Muslim Pro
  (`_source === 'muslimpro'`) كان يُستخدم مباشرة؛ أي كاش آخر (من Aladhan أو
  الحساب المحلي) كان **يُتجاهل عمداً** (تعليق v36: «autocurar») وتُعاد كل
  سلسلة الشبكة كاملة (Muslim Pro المباشر ثم Aladhan) في **كل** تحميل لصفحة
  البداية، ولو كانت هناك بيانات صالحة محفوظة أصلاً.
- المشكلة: مزامنة Muslim Pro المباشرة (`js/muslimpro-sync.js`) تحتاج إما
  خادم وسيط (Cloudflare Worker في `backend/` — خطوة نشر منفصلة لم تُفعَّل)
  أو طلبات مباشرة إلى `app.muslimpro.com`/DuckDuckGo تفشل عادة بسبب CORS في
  المتصفح. أي بلا الخادم الوسيط، هذه المزامنة **تفشل دائماً**، فكانت **كل**
  عودة لصفحة البداية تنتظر محاولة شبكة فاشلة ثم تلجأ لـ Aladhan من جديد —
  وهذا بالضبط سبب «إعادة التحميل في كل مرة» رغم أن الكاش موجود وصالح.
- **الإصلاح**: أي كاش صالح لليوم (من أي مصدر) يُستخدم فوراً الآن — فورية
  حقيقية. إن لم يكن من Muslim Pro، يُطلق تحديث في الخلفية (`_fetchFreshTimings`
  عبر `_refreshTimingsInBackground`) لا يُعطّل هذا الاستدعاء؛ إن نجح يُحدَّث
  الكاش للمرة التالية فقط — بنفس فكرة stale-while-revalidate المستخدمة في
  `sw.js` لملفات التطبيق. آلية التصحيح التلقائي (v36) لم تُحذف، فقط لم تعد
  تُعطِّل الواجهة.

### 🕐 السبب الجذري الثاني — الجولة التعريفية كانت تعيد رسم البداية من الصفر
- `Onboarding.finish()` (js/onboarding.js) كانت تستدعي دالة رسم الصفحة
  الحالية مباشرة **دائماً** عند إغلاق الجولة — حتى لو كانت صفحة البداية قد
  انتهت من التحميل بالفعل تحت الجولة (تبدأ `Router.go('home')` بالتوازي مع
  ظهور الجولة في `js/app.js`، فتكون عادة جاهزة قبل أن ينهي المستخدم الجولة).
  النتيجة: بعد إتمام الجولة مباشرة، كانت البداية تُعاد إلى الهيكل العظمي
  (skeleton) وتُعيد طلب الموقع/الأوقات من الصفر — الانتظار الذي أُبلغ عنه
  بعد الصفحات التعريفية.
- **الإصلاح**: `finish()` الآن يعيد الرسم فقط إذا تغيّر الموقع فعلياً أثناء
  الجولة (تأكيد GPS/بحث يدوي، أو تثبيت موقع افتراضي لعدم وجود أي موقع سابق)
  — إن كانت البداية جاهزة أصلاً بنفس الموقع، تبقى كما هي: فورية.

### 📦 فجوة في تخزين `sw.js` مؤقتاً — ملفات الجولة التعريفية لم تكن مُحمَّلة مسبقاً
- منذ v1.0.47 صارت `css/onboarding.css` و`js/onboarding.js` و
  `js/privacy-policy.js` (و`js/quran-tajweed.js` من إصدار لاحق) جزءاً من
  `index.html` دون إضافتها لقائمة `CORE_ASSETS` في `sw.js` — أُضيفت الآن؛
  فتح أول مرة بلا إنترنت إطلاقاً كان يمكن أن يفشل تحديداً في هذه الملفات.
- `js/version.js`: `APP_VERSION` → `1.0.61` لتفعيل كاش جديد في `sw.js`
  (يحذف تلقائياً الكاش القديم الناقص).

## v1.0.59 — 2026-09-20 · تصحيحات تنبيه الأذان والإشعار الثابت

### 🐢 المشكلة المُبلَّغة
- رسالة كتم/تفعيل الأذان تظهر بشكل معطوب في التوست (خلل بصري).
- في وضع «أول تكبيرتين فقط»، كانت التكبيرة الثانية تُقطع أحياناً قبل اكتمالها.
- وجود مفتاحين منفصلين لنفس ميزة تنبيه الأذان («تنبيه الأذان» و«بطاقة تنبيه
  الأذان» في قسم مختلف) بأسماء متشابهة مربكة، رغم أنهما يجب أن يكونا إشعاراً
  واحداً بإعداد واحد.
- الوقت المتبقي في الإشعار الثابت للصلاة القادمة يتحدّث كل دقيقة فقط، فتبدو
  الثواني متجمدة بين التحديثات بدل أن تُحسب لحظياً.

### 🔎 الأسباب الجذرية
1. **`pages/profile.js` — `setAdhanMuted()`**: كانت رسالة التوست تمرَّر كوسم
   HTML (`<i class="fas fa-volume-xmark"></i> ...`)، لكن `showToast()` في
   `js/app.js` يكتب الرسالة بـ `textContent` لا `innerHTML`، فيظهر الوسم كنص
   خام بدل أيقونة.
2. **`js/adhan.js` / `pages/profile.js`**: مدة قطع وضع «أول تكبيرتين» كانت
   ثابتة على 12 ثانية للجميع، بينما تختلف مدة نطق التكبيرتين فعلياً حسب
   المؤذّن/الصوت المُختار — فتُقطع الثانية منهما قبل انتهائها في عدة أصوات.
3. **`js/notif-center.js` — `showAdhanAlert()`**: كانت تتحقق من مفتاح
   `NotifCenter.adhanAlert` (غير مرتبط بمفتاح `PrayerNotifications.isEnabled`
   الرئيسي) لتقرر إظهار البطاقة الغنية (حديث + أزرار) أو إشعاراً بسيطاً —
   ميزتان منفصلتان لواجهة مستخدم واحدة منطقياً.
4. **`js/notif-center.js` — `startPersistent()`**: الفاصل الزمني للتحديث
   كان `setInterval(fn, 60 * 1000)`، فيتغيّر النص مرة كل دقيقة فقط.

### ✅ الإصلاح
- **`pages/profile.js`**: رسالة الكتم/التفعيل الآن برموز تعبيرية (🔇/🔊) تُعرض
  بشكل صحيح مهما كانت طريقة كتابتها في التوست.
- **`js/adhan.js` + `pages/profile.js`**: رُفعت المدة الافتراضية إلى 16 ثانية،
  وأُضيف شريط تمرير جديد «مدة القطع» (8-25 ثانية) يظهر في إعدادات الأذان عند
  اختيار وضع «أول تكبيرتين فقط»، مع زر تجربة فورية — ليضبطه المستخدم بحسب
  الصوت الذي اختاره.
- **`js/notif-center.js`**: أُزيل مفتاح `adhanAlert` المستقل؛ `showAdhanAlert()`
  تعرض البطاقة الغنية دائماً (هي أصلاً لا تُستدعى إلا حين يكون مفتاح «تنبيه
  الأذان» الرئيسي مفعّلاً). أُزيل الصف المكرر «بطاقة تنبيه الأذان» من صفحة
  الإعدادات، وحُدِّث وصف المفتاح الرئيسي (بالعربية/الإسبانية/الإنجليزية)
  ليذكر الحديث وزرّي الإيقاف والتذكير صراحةً — إشعار واحد بإعداد واحد.
- **`js/notif-center.js`**: الفاصل الزمني لتحديث الإشعار الثابت صار ثانية
  واحدة بدل الدقيقة، فيُحسب الوقت المتبقي لحظياً. *(قيد تقني في تقنية الويب:
  هذا يعمل أثناء تشغيل الصفحة/نشاطها الأخير فقط — لا توجد طريقة عبر الويب
  لإبقاء إشعار نظام حي التحديث والتطبيق مغلق تماماً.)*

### 🔧 أخرى
- رُفع `APP_VERSION` إلى 1.0.59 لتجديد كاش الـ Service Worker.

## v1.0.58 — 2026-09-19 · تصحيح مواعيد المناسبات الهجرية (تقدُّم يوم إلى يومين) وتوحيد مصدر التاريخ الهجري

### 🐢 المشكلة المُبلَّغة
- مواعيد المناسبات القادمة في التقويم الهجري («مناسبات قادمة») تظهر **مبكرةً بيوم إلى يومين**.
  مثال: بداية رمضان ١٤٤٨ كانت تظهر ٦ فبراير ٢٠٢٧ والصحيح **٨ فبراير ٢٠٢٧** (الاثنين).

### 🔎 الأسباب الجذرية
1. **`pages/calendar.js` — `_computeUpcomingEvents()`**: كان يقدّر التاريخ بمتوسط طول الشهر القمري
   (٢٩٫٥٣٠٦ يوماً) وبمرساة خاطئة (`١ محرم ١٤٤٧ = 2025-06-25` والصحيح `2025-06-26`) ⇒ خطأ ثابت
   بين −١ و −٢ يوم في **كل** المناسبات (تم قياسه على ٣٦ موعداً للسنوات ١٤٤٧–١٤٤٩).
2. **`js/api.js` — `_gregorianToHijri()`** (المسار غير المتصل بالإنترنت): تقويم إسلامي *حسابي*
   وليس أم القرى ⇒ يختلف بيوم أو يومين في ~٥٣٪ من الأيام (٥٧٩ من ١٠٩٦ يوماً). وكان يُعلَّم
   مع ذلك على أنه «تقريبي» فقط في الصفحة الرئيسية.
3. **`pages/calendar.js` — `formatMonth()`**: `setMonth()` يتجاوز الشهر في الأيام ٢٩–٣١
   (٣١ أغسطس + شهر ⇒ ١ أكتوبر) فيقفز زر «›» فوق شهر كامل.

### ✅ الإصلاح
- **`js/hijri.js` — محرّك جديد `HijriCalc`** (مصدر واحد للتاريخ الهجري، كله محلي وفوري وبلا شبكة):
  ١) `Intl` بتقويم `islamic-umalqura` (يُتحقَّق منه عند الإقلاع)، ٢) جدول أم القرى مدمج (١٤٤٦–١٤٦٠هـ)،
  ٣) الحسابي كآخر ملاذ فقط (ويُعلَّم `exact:false`). فيه: `fromGregorian` / `toGregorian` / `nextOccurrence`.
- **`pages/calendar.js`**: «مناسبات قادمة» صارت تحسب التاريخ الميلادي **بدقة** لكل مناسبة (مع السنة
  عندما تكون في العام القادم) + ملاحظة أن التواريخ وفق أم القرى وقد تختلف بيوماً حسب رؤية الهلال.
  و`formatMonth()` يثبّت اليوم ١ قبل إضافة الأشهر.
- **`js/api.js`**: `gregorianToHijri` و`getHijriCalendarMonth` و`_gregorianToHijri` تعتمد `HijriCalc` أولاً
  (لا انتظار للشبكة، ولا كاش قديم من Aladhan)، وجدول الصلاة الشهري يُوحَّد تاريخه الهجري معه
  (`_alignHijriMonth`) ليتطابق الجدول والتقويم والصفحة الرئيسية. لم تعد شارة «تقريبي» تظهر للتاريخ الهجري
  إلا إذا سقط المحرّك إلى الحسابي.
- **`scripts/verify-hijri.js`** (`npm run verify:hijri`): اختبار بلا اعتماديات يقارن المحرّك بأم القرى
  وبالتقويم الرسمي للمسجد ٢٠٢٦ (٢١٤ يوماً موسوماً: ٠ اختلاف) ويتحقق من رمضان ١٤٤٨ وحالة `formatMonth`.

### 📅 المواعيد المعتمدة القادمة (أم القرى)
- الإسراء والمعراج: الثلاثاء ٥ يناير ٢٠٢٧ · ليلة النصف من شعبان: ٢٣ يناير ٢٠٢٧
- **بداية رمضان ١٤٤٨: الاثنين ٨ فبراير ٢٠٢٧** · ليلة القدر (٢٧): ٦ مارس ٢٠٢٧
- عيد الفطر: الثلاثاء ٩ مارس ٢٠٢٧ · يوم عرفة: ١٥ مايو ٢٠٢٧ · عيد الأضحى: ١٦ مايو ٢٠٢٧

### 🔧 أخرى
- رُفع `APP_VERSION` إلى 1.0.58 لتجديد كاش الـ Service Worker.

## v1.0.52 — 2026-09-18 · إصلاح الخروج من الكويز/الكورسات/الأدعية/الأذكار + الحصري قارئاً افتراضياً + «قُبَّة» في الجولة التعريفية

### 🐢 المشكلة المُبلَّغة
- بعد فتح أي تبويب داخلي (فئة في الأدعية، مجموعة في الأذكار، مستوى/أسئلة في
  الكويز، دورة/درس في الكورسات) لم تعمل أزرار «رجوع / خروج / أخرى» ولم يمكن
  الخروج منها.
- **السبب الجذري** (`js/router.js`): حارس v41 («لا تُعِد رسم الصفحة إن كانت
  الوجهة هي الصفحة الحالية») كان يُطبَّق على **أي** استدعاء لـ `Router.go`
  وليس على نقرات شريط التبويبات السفلي فقط. هذه الصفحات الأربع ترسم
  واجهاتها الداخلية داخل نفس المسار (`wisdom/quiz`، `wisdom/courses`،
  `wisdom/duas`، `wisdom/adhkar`)، وأزرار الخروج فيها تستدعي
  `Router.go('wisdom/…')` وهي أصلاً على ذلك المسار ← يتجاهلها الحارس.

### ✅ الإصلاح
- **`js/router.js`**: الحارس صار يعمل فقط عند طلبه صراحةً
  (`{ skipIfCurrent: true }`) وهو ما يمرّره معالج شريط التبويبات السفلي؛
  أما أي استدعاء آخر لنفس المسار فيُعيد الرسم كالمعتاد.
- عند العودة لنفس المسار يُستبدل سجل المتصفح (`replaceState`) بدل تكديس
  مدخلات مكررة.

### 🔧 تعديلات أخرى
- **القرآن**: حُذف شريط «أدعية قراءة القرآن» من الصفحة الرئيسية للقرآن
  (يبقى زر الأدعية داخل شريط أدوات قارئ السورة).
- **القارئ**: القارئ الرئيسي والافتراضي صار الحصري (`ar.husary`): أول القائمة
  في `CONFIG.RECITERS`، وهو الافتراضي في `AppState`/`Storage`/`api.js`/
  `quran-offline.js`. ترحيل لمرة واحدة لمن كان على المعيقلي (الافتراضي
  السابق) أو العفاسي؛ من اختار قارئاً آخر يبقى على اختياره.
- **الجولة التعريفية وسياسة الخصوصية**: الاسم «قُبى» ← «قُبَّة»
  (`js/onboarding.js`، `js/privacy-policy.js`).
- رُفع `APP_VERSION` إلى 1.0.52 لتجديد كاش الـ Service Worker.

## v1.0.51 — 2026-09-18 · إصلاح قطع الأذان قبل إتمام أول تكبيرة (وضعا «كامل» و«أول تكبيرتين»)

### 🐢 المشكلة المُبلَّغة
- الأذان كان ينقطع أحياناً قبل إتمام تكبيرة واحدة حتى — سواء كان وضع
  الأذان مضبوطاً على «كامل» (يجب أن يُسمع الأذان بأكمله) أو على «أول
  تكبيرتين فقط» (يجب أن تُسمع التكبيرتان الأوليان كاملتين قبل التوقف).
- **السبب الجذري** (`js/adhan.js`): عندما تنقطع الشبكة أو يبطئ الخادم في
  منتصف تحميل الصوت، يفسّر المتصفح ذلك أحياناً على أنه "نهاية طبيعية"
  للصوت ويطلق حدث `ended` رغم أن الصوت المُشغَّل الفعلي لا يتجاوز ١-٢
  ثانية من ملف أطول بكثير. الكود القديم كان يقبل ذلك كنجاح كامل
  (`finish(true)`) وينتقل فوراً للصوت التالي (في وضع «كامل») أو يُنهي
  التشغيل مباشرة (في وضع «أول تكبيرتين») — فيبدو الأذان وكأنه "انقطع" من
  دون سبب ظاهر، حتى مع رابط احتياطي (fallback) لم يكن هناك أي محاولة
  إضافية إن فشل هو الآخر بنفس الطريقة.

### ✅ الإصلاح
- **`js/adhan.js` — `AdhanService._playVoice()`**: عند حدث `ended` يُقارَن
  الآن الوقت الفعلي المُشغَّل (`currentTime`) بالمدة الحقيقية للملف
  (`duration`)؛ إن كان الفارق كبيراً (أكثر من ١.٥ ثانية) يُعامَل الأمر
  كفشل شبكة حقيقي وليس نهاية شرعية للصوت.
- عند أي فشل (خطأ تحميل، فشل الشبكة، أو القطع المبكر أعلاه) يمرّ التشغيل
  الآن بثلاث محاولات كحد أقصى بدل محاولة واحدة فقط: الرابط الأساسي، ثم
  الرابط الاحتياطي، ثم إعادة محاولة أخيرة لنفس الرابط الاحتياطي — بدل
  الاستسلام فوراً إذا تكرر العطل.
- **النتيجة**: وضع «الأذان كامل» يُشغّل الآن الصوتين (الأول ثم الثاني)
  كاملين فعلاً بدون قطع مبكر، ووضع «أول تكبيرتين فقط» يضمن سماع
  التكبيرتين الأوليين كاملتين (حتى مدة `takbeerDuration`، ١٢ ثانية
  افتراضياً) قبل أي توقف — ولا يتوقف الصوت بعد الآن في منتصف تكبيرة
  واحدة بسبب مجرد تعثّر مؤقت في الشبكة.

## v1.0.50 — 2026-09-18 · إضافة سانتياغو دي كوبا وهولغين + تصحيح جذري لمخاطر «تطابق الاسم» في مزامنة Muslim Pro

### 🐢 المشكلة المُبلَّغة
- سانتياغو دي كوبا وهولغين لم تكونا موجودتين في `Cities.LIST` أصلاً، فأي
  اختيار لهما (كموقع رئيسي أو كـ«horario ثانوي») كان يمرّ إجبارياً بمسار
  الحلّ الديناميكي في `MuslimProSync._resolveSlug` (Nominatim + بحث نصي في
  DuckDuckGo) بدل الاعتماد على جدول مدن مُتحقَّق منه — وهو بالضبط ما يفعله
  التطبيق بالفعل مع أي «مدينة غير مُدرجة».
- **السبب الجذري**: ذلك المسار الديناميكي كان يقبل أول رابط `muslimpro.com`
  يظهر في نتائج البحث النصي عن اسم المدينة، **دون التحقق من أن الدولة
  تطابق** إحداثيات المستخدم. الاسم «سانتياغو» يخصّ أيضاً مدناً في تشيلي
  وكولومبيا والمكسيك وإسبانيا لها صفحات Muslim Pro شهيرة جداً — فكان
  البحث قد يستقر خطأً على توقيت «سانتياغو، تشيلي» (نصف الكرة الجنوبي)
  بدل «سانتياغو دي كوبا»، منتجاً فرقاً كبيراً وغير صحيح عن هافانا رغم
  كونهما في نفس البلد ونفس التوقيت الرسمي (America/Havana، UTC-5/-4).
- بالإضافة لذلك، حتى في مسار الاحتياط غير المتصل (PrayerCalc)، أي مدينة
  غير موجودة في جدول `DualTiming._tzFor` كانت تحصل على فرق توقيت = صفر
  عند استخدامها كـ«horario ثانوي» من جهاز خارج كوبا — أي تُعامَل كأنها في
  نفس منطقة الجهاز الزمنية بدل America/Havana.

### ✅ الإصلاح
- **`js/cities.js`**: أُضيفت `santiago_de_cuba` (20.0217, -75.8294) و
  `holguin` (20.8869, -76.2592) إلى `Cities.LIST` — بهذا تصبحان قابلتين
  للاختيار من مُنتقي المدن (الموقع الرئيسي في الملف الشخصي **و** الـ
  horario الثانوي في الرئيسية)، ويتعرّف عليهما `Cities.match()`/
  `CityClock` تلقائياً.
- **`js/dual-timing.js`**: أُضيفت المدينتان إلى جدول `_tzFor()` بمنطقة
  `America/Havana` — نفس منطقة هافانا تماماً، لأن كوبا بأكملها تستخدم
  توقيتاً رسمياً واحداً. الفرق الحقيقي المتبقي بين هافانا وسانتياغو دي
  كوبا/هولغين هو فقط فرق خط الطول الطبيعي في حساب الفجر/المغرب (نحو
  20-30 دقيقة كحد أقصى) — وهو **متوقَّع وصحيح فلكياً**، تماماً كما يحدث
  بين مدينتين في نفس المنطقة الزمنية داخل أي بلد آخر.
- **`js/muslimpro-sync.js` (تصحيح جذري يشمل كل المدن، لا سانتياغو دي كوبا
  فقط)**: `_resolveSlug()` الآن يتحقق من أن رابط Muslim Pro الذي عثر عليه
  البحث النصي يخصّ **نفس دولة** الإحداثيات (بمطابقة اسم الدولة المُطبَّع
  مع مسار الرابط) قبل قبوله؛ إن لم يتطابقا يُرفض الناتج وتتولى Aladhan
  الحساب مباشرة من الإحداثيات (لا مخاطرة فيها إطلاقاً لأنها لا تعتمد على
  بحث نصي بالاسم). هذا يمنع أي مدينة أخرى تتشارك اسمها مع مدينة مشهورة في
  بلد مختلف من الوقوع في نفس الخطأ مستقبلاً.

### 🔁 يشمل الإصلاح
جميع المسارات الأربعة المطلوبة، لأنها تتقاطع كلها في نفس نقاط الكود التي
عُدِّلت (`Cities.LIST`، `DualTiming._tzFor`، `MuslimProSync._resolveSlug`):
**التوقيت الرئيسي** (`pages/profile.js` → `LocationService.setManual` →
`API.getPrayerTimes`)، **الثانوي** (`js/dual-timing.js`)، **صفحة الصلاة**
(`pages/prayer.js`، تبويب «times»)، و**الجدول الشهري**
(`pages/prayer.js` → `API.getPrayerTimesMonth`).

## v1.0.47 — 2026-09-16 · الجولة التعريفية وسياسة الخصوصية عند أول تشغيل

### ✨ الجديد
- **صفحات تعريفية (Onboarding)** تظهر مرة واحدة بعد اختيار اللغة مباشرة،
  وبنفس اللغة المختارة (عربي/إسباني/إنجليزي): ترحيب بشعار «قُبى» ← أبرز
  ميزات التطبيق ← الخصوصية أولاً ← تحديد الموقع.
- **صفحة تحديد الموقع**: تحديد تلقائي (GPS) مع بطاقة تأكيد «هل هذا موقعك؟»
  أو بحث يدوي عن المدينة بالاسم، مع إمكانية التخطي (يُستخدم الموقع الافتراضي
  ويُضبط لاحقاً من الإعدادات).
- **صفحة سياسة خصوصية محلية** (AR/ES/EN، تعمل دون إنترنت) تُفتح من رابط
  «سياسة الخصوصية» أسفل صفحة الخصوصية في الجولة — نص خاص بتطبيق قبة:
  بلا حسابات ولا خوادم، الموقع للمواقيت والقبلة فقط، بلا إعلانات ولا تتبع.
- التصميم بهوية قبة (الزمردي الملكي + الذهبي) ولا يظهر مرة أخرى بعد إتمامه.

## v1.0.46 — 2026-09-16 · إعادة تصميم بوصلة القبلة: ثبات، شمال حقيقي صحيح، ومعايرة

### 🐢 السبب الجذري لاهتزاز الإبرة
- الإبرة كانت تُحدَّث في `pages/prayer.js` مباشرة داخل معالج الحدث (حتى 60
  مرة/ثانية على بعض الأجهزة)، بلا أي تجميع على إطار الرسم — كل قراءة حساس،
  مهما كانت دقيقة، تكتب فوراً إلى الـ DOM.
- الأخطر: كانت الصفحة تستمع لكلٍّ من `deviceorientationabsolute` و
  `deviceorientation` **معاً** بنفس المعالج. على أندرويد/كروم يُطلق
  المتصفح الحدثين للحركة الفيزيائية نفسها أحياناً — أحدهما مرجعه المغناطيسي
  المطلق والآخر قد ينجرف عن اتجاه الصفحة الأولي — فكانت البوصلة "تتجاذب"
  بين قراءتين مختلفتين لنفس اللحظة، وهذا ما يظهر للمستخدم كاهتزاز.
- `transition` الإبرة في CSS كانت تستخدم منحنى مرن (`cubic-bezier(0.34,
  1.56, ...)`) بارتداد (overshoot) — كل تحديث دقيق جداً كان يعيد تشغيل
  ارتداد جديد قبل انتهاء السابق، فيظهر تذبذب مستمر حتى لو كانت القراءات
  نفسها مستقرة.

### ✅ الإصلاح
- تجميع كل قراءات الحساس بين إطارات الرسم عبر `requestAnimationFrame` —
  تحديث واحد للـ DOM لكل إطار كحد أقصى، بدل تحديث لكل قراءة حساس.
- عند وصول أول حدث `deviceorientationabsolute` يُعتمد عليه حصراً وتُلغى
  مباشرة مراقبة `deviceorientation` (iOS لا يُطلق `deviceorientationabsolute`
  إطلاقاً فلا يتأثر — يستمر بـ `webkitCompassHeading` كما كان).
- `transition` الحلقة الآن خطية وقصيرة (`0.12s linear`) بلا ارتداد.
- ضُيِّق «حزام السكون» في `js/qibla.js` (تصفية EMA التكيفية) قليلاً
  لإبرة أكثر ثباتاً حين لا توجد حركة فعلية.

### 🧭 السبب الجذري لخطأ الشمال الحقيقي
- الكود كان يفترض أن `webkitCompassHeading` (آيفون) وحدث
  `deviceorientationabsolute` بعلم `absolute:true` (أندرويد) يعطيان **شمالاً
  حقيقياً** جاهزاً، فيتخطى تصحيح الانحراف المغناطيسي لهما.
- الحقيقة (وثّقتها Apple نفسها): `webkitCompassHeading` "قياس بالدرجات
  نسبة إلى الشمال **المغناطيسي**"، وليس الحقيقي. وعلم `absolute` في
  المواصفة القياسية يعني فقط أن القراءة غير نسبية لتوجّه الصفحة عند
  التحميل — وليس أنها مصحَّحة بنموذج WMM. النتيجة: بوصلة مُزاحة عن الشمال
  الحقيقي بمقدار الانحراف المغناطيسي المحلي في كل مكان تقريباً.
- **الإصلاح**: كل قراءة من أي مصدر (آيفون أو أندرويد) تُعامَل الآن كقراءة
  **مغناطيسية** دائماً، ويُطبَّق عليها تصحيح الانحراف من جدول WMM في
  `js/qibla.js` في كل مرة — بلا استثناء لأي منصة.

### 🕋 تصميم جديد: شعار الكعبة + سهم الاتجاه (كما في تطبيقات الصلاة)
- حلقة البوصلة (حروف N/E/S/W) تدور فعلياً مع الهاتف الآن — الشمال يشير
  فعلاً إلى الشمال الحقيقي، بدل حلقة ثابتة كما كانت سابقاً.
- 🕋 شعار الكعبة أصبح عنصراً ثابت الموضع الزاوي على الحلقة (عند اتجاه
  القبلة الحقيقي) فيتأرجح بصرياً حول القرص عند إدارة الهاتف، ويبقى منتصباً
  دوماً (دوران عكسي تلقائي).
- سهم ثابت جديد (`device-pointer`) لا يدور أبداً — يمثّل دائماً الاتجاه
  الذي يشير إليه الهاتف الآن. يدير المستخدم هاتفه حتى تصل 🕋 إلى السهم
  الثابت — يضيء الاثنان أخضر عند التطابق (مع اهتزاز خفيف Haptic).
- نقطة الشمال المغناطيسي أصبحت أيضاً طفلاً في الحلقة الدوارة (إزاحة ثابتة
  = الانحراف المحلي)، فلا تحتاج تحديثاً منفصلاً كل إطار.

### 🎯 زر «معايرة» بدل «تفعيل البوصلة»
- الزر الآن دائماً «معايرة» (`PrayerPage.calibrateCompass()`) — يطلب إذن
  iOS عند أول استخدام فقط، ثم يعيد ضبط مرشّح التنعيم (`Qibla.resetSmoothing()`)
  ويعيد ربط المستمعين في كل ضغطة، فيصلح كمعايرة حقيقية لاحقاً أيضاً.
- عند الضغط تظهر نافذة سفلية (`showCalibrationOverlay`) تطلب من المستخدم
  تحريك الهاتف على شكل الرقم 8 مع رسم متحرك يوضّح الحركة، وتختفي تلقائياً
  بعد 6 ثوانٍ أو بزر «تم».

## v1.0.45 — 2026-09-15 · إعادة Service Worker (بشكل آمن هذه المرة): فتح فوري + عمل بلا إنترنت

### 🐢 السبب الجذري لـ«تحميل الصفحة الرئيسية في كل مرة» ولظهورها فارغة بلا إنترنت
- إصدار v1.0.0 أزال الـ Service Worker و`manifest.json` كلياً («🧹 PWA
  eliminado»)، ثم v1.0.32 أضاف سكربتاً في `index.html` يُلغي تسجيل أي
  Service Worker ويمسح كل الكاش في كل تحميل — لمعالجة SW قديم كان يبقى
  عالقاً للأبد على الأجهزة المثبَّتة (لأنه كان بلا `skipWaiting`/
  `clients.claim`، ولأن اسم الكاش لم يكن مرتبطاً برقم الإصدار).
- النتيجة: بلا أي Service Worker، يضطر المتصفح لإعادة تحميل كامل «هيكل
  التطبيق» (HTML/CSS/JS/بيانات، عدة ميغابايت) من الشبكة في كل فتح أو
  استئناف — ومن هنا «التحميل في كل مرة». وعند الفتح الأول بلا إنترنت لا
  يوجد شيء محفوظ ليُعرض، فتظهر الصفحة فارغة — رغم أن `pages/home.js` نفسها
  تعرف أصلاً كيف ترسم أوقات صلاة تقديرية بلا اتصال؛ المشكلة أن الـ JS لم
  يكن يصل للتحميل أصلاً.
- **لم تكن هذه المشكلة موجودة في النماذج القديمة** لأنها كانت تملك
  Service Worker حقيقياً يخزّن هيكل التطبيق («v5.0.0 — Modo offline
  real»)، قبل أن يُزال بسبب علة أخرى غير مرتبطة بوجوده أصلاً.

### ✅ الإصلاح — `sw.js` جديد مُصمَّم لتفادي علة v1.0.32 من جذورها
- كاش مرتبط برقم الإصدار (`quba-shell-${APP_VERSION}`, من `js/version.js`
  — نفس المصدر الوحيد للحقيقة الذي كانت تشير إليه تعليقات الملف) — كل
  إصدار جديد يحصل على كاش جديد.
- `skipWaiting()` + `clients.claim()` — الـ Service Worker الجديد يتولى
  التحكم فوراً، دون انتظار إغلاق كل التبويبات (كما يحدث فعلياً في تطبيق
  PWA/TWA مثبَّت لا يُغلق أبداً بالكامل).
- `activate()` يحذف تلقائياً أي كاش غير الإصدار الحالي — عدا
  `quba-quran-audio-v1` (خاصة بـ `js/quran-offline.js`، بلا علاقة بهيكل
  التطبيق). بهذا تُنظّف كل نسخة نفسها بنفسها؛ لم يعد داعٍ لإلغاء تسجيل الـ
  SW يدوياً من `index.html` في كل تحميل — فعل ذلك الآن كان سيُبطل هذا
  الإصلاح نفسه.
- استراتيجية "cache-first + مراجعة في الخلفية": الفتح/الاستئناف يُرسم
  فوراً من الكاش (لا انتظار شبكة)، بينما تُحدَّث الكاش في الخلفية للفتحة
  التالية.
- `manifest.json` أُعيد أيضاً (كان مطلوباً لتغليف APK عبر PWA
  Builder/Bubblewrap حسب `APK_GUIDE.md`) مع أيقونتين 192×192 و512×512
  جديدتين (`assets/icon-192.png`, `assets/icon-512.png`).
- `index.html`: أُبدل سكربت «إلغاء التسجيل دائماً» بتسجيل عادي لـ
  `./sw.js`، وأُضيف `<link rel="manifest">` (الـ CSP الحالي يسمح بهما
  أصلاً عبر `worker-src 'self'` و`manifest-src 'self'`).

## v1.0.44 — 2026-09-14 · توسعة قاعدة «آية اليوم» و«دعاء اليوم»

### 📖 آية اليوم: من 36 إلى 200 آية
- حُذفت آية الطلاق 65:3 («ويرزقهم من حيث لا يحتسب…») لأن معناها متعلّق بالآية
  التي قبلها (65:2 «ومن يتق الله يجعل له مخرجاً») ولا تُفهم مستقلة للقارئ.
- أُضيفت 165 آية جديدة مختارة من سور المصحف كلها، وجميعها **مستقلة المعنى**
  (تُفهم وحدها دون الحاجة إلى آية قبلها أو بعدها) وذات حكمة وعظة.
- الترجمة الإسبانية لكل آية مأخوذة آلياً من ترجمة عيسى غارسيا المعتمدة في
  التطبيق نفسه (`data/garcia/*.json`) — بلا أي ترجمة مرتجلة.
- النص العربي بالرسم العثماني من المصحف المحلي (`data/quran_full_ar.js`)،
  واللفظ اللاتيني من `data/quran_transliteration.js`، ولكل آية حكمة يومية
  بالإسبانية والإنجليزية والعربية.

### 🤲 دعاء اليوم: من 23 إلى 60 دعاءً
- 30 دعاءً قرآنياً (أدعية الأنبياء والمؤمنين: إبراهيم، موسى، يوسف، زكريا،
  سليمان، نوح، أيوب، أصحاب الكهف، آسية…) — تحقّق آلي من أن نص كل دعاء مطابق
  لنص المصحف العثماني المحلي، وترجمته الإسبانية من ترجمة عيسى غارسيا.
- 7 أدعية نبوية من «حصن المسلم» (العافية، الهدى والتقى، إصلاح الدين والدنيا،
  القنوت، حفظ النعم، تزكية النفس، استفتاح صلاة الليل) بمراجعها من صحيح مسلم
  وأبي داود والترمذي.
- كل دعاء له عنوان وترجمة بالعربية والإسبانية والإنجليزية ولفظ لاتيني.

## v1.0.38 — 2026-09-13 · تصحيح محاكاة أوقات الصلاة (الأردن/فلسطين) بعد التحقق المباشر

### 🇯🇴 الأردن — الزاوية الصحيحة بدل "المغرب+90 دقيقة"
- افتراض v1.0.35 ("العشاء = المغرب + 90 دقيقة" في الأردن) لم يصمد أمام التحقق
  المباشر (2026-09-13) من موقع وزارة الأوقاف الأردنية الرسمي (awqaf.gov.jo):
  الفارق الفعلي بين المغرب والعشاء في أيلول يدور حول 76-77 دقيقة، وليس 90.
- على مدى 10 أيام متتالية (13-22 أيلول 2026) من نفس الجدول الرسمي، تبيّن أن
  المعادلة الصحيحة هي زاوية **فجر 18° / عشاء 18°** (تطابق طريقة "جامعة العلوم
  الإسلامية، كراتشي") مع ارتفاع عمّان الحقيقي (~950 م) — بمتوسط خطأ أقل من
  دقيقة واحدة عبر كل الأيام العشرة، مقابل عمّان (31.9539°, 35.9106°).
- `PrayerCalc.METHOD_PARAMS[19]` محدّث بهذه القيم. عند الرجوع لـ Aladhan (حين
  لا يتوفر Muslim Pro ولا اتصال)، تُستخدم طريقتها الأصلية **رقم 23** ("Ministry
  of Awqaf, Islamic Affairs and Holy Places, Jordan") بدل تحويلها إلى رابطة
  العالم الإسلامي (3) مع رقعة يدوية — أدق وأبسط.

### 🇵🇸 فلسطين — إزالة قاعدة الأردن الخاطئة
- تأكيد مباشر من واجهة Muslim Pro نفسها (prayer-times.muslimpro.com) أن رام
  الله ونابلس وغزة والقدس مصنّفة "-Muslim World League (MWL)"، وليس وزارة
  أوقاف الأردن — قاعدة v1.0.35/v41 كانت تُطبّق نفس تصحيح الأردن على فلسطين
  خطأً. أُزيلت من `API._effectiveMethod` و`PrayerCalc.applyRegionalCorrections`؛
  فلسطين تستخدم الآن طريقة المستخدم العامة (رابطة العالم الإسلامي افتراضياً)
  دون أي تصحيح قسري.

### 🇪🇸🇨🇴🇨🇺 مدريد/بوغوتا/هافانا — بلا تغيير في الطريقة، تحقّق فقط
- تحقق مباشر: مدريد (جدول أيلول 2026 الرسمي للمركز الثقافي الإسلامي بمدريد،
  نفس الجهة التي ينسب إليها Muslim Pro صفحة مدريد) يطابق رابطة العالم الإسلامي
  (فجر 18°/عشاء 17°) بلا تصحيح ارتفاع (تطبيقه هنا يُبعد عن الرقم الرسمي بدل
  تقريبه — عكس ما لوحظ في عمّان). هافانا مؤكدة أيضاً "MWL" من Muslim Pro
  مباشرة. بوغوتا بلا أي تخصيص من Muslim Pro، فتبقى على نفس الطريقة الافتراضية.
- `applyRegionalCorrections` أصبحت دالة "no-op" (لا تُغيّر شيئاً) بدل حذفها،
  لتبقى نقطة التقاطع الوحيدة إن ظهر مستقبلاً تصحيح إقليمي حقيقي وموثّق.

### 🔁 التوقيت الثانوي (franja) وتنبيهات منتصف الليل — ثغرتان إضافيتان مكتشفتان أثناء التحقق
- **الشريط الثانوي (`dual-timing.js`)**: كان يستخدم `API._effectiveMethod`
  بشكل صحيح (فيحصل على طريقة الأردن 19 وإلغاء تخصيص فلسطين)، **لكن** لم يكن
  يُطبّق تصحيح الارتفاع إطلاقاً — لا في مساره دون اتصال ولا في مساره عبر
  Aladhan. يعني ذلك أن أي مدينة ثانوية مرتفعة (عمّان، بوغوتا، كيتو، مكسيكو
  سيتي…) كانت تظهر شروق/مغرب مختلفَين عن نفس المدينة في الشاشة الرئيسية.
  أُضيفت دالتا `_elevationForCity` (متزامنة، للقراءة الفورية دون اتصال) و
  `_elevationForCityAsync` (لمسار Aladhan) تخزّنان الارتفاع لكل مدينة في
  Storage بمفتاح `city_elev_<id>` وتُستدعيان الآن في كلا المسارين.
- **إعادة جدولة تنبيهات منتصف الليل (`notifications.js`)**: مسار الحساب
  المحلي عند فشل الشبكة كان يستخدم `AppState.settings.calculationMethod`
  الخام مباشرة (بلا المرور عبر `API._effectiveMethod`) وبلد فارغ — أي مستخدم
  في الأردن يفقد الاتصال عند منتصف الليل كانت تنبيهاته تُعاد جدولتها بطريقة
  حساب خاطئة. صُحح ليستخدم نفس تحليل الطريقة والبلد المستخدَم في باقي التطبيق.


## v1.0.37 — 2026-09-11 · دمج خصائص v36 في النسخة الجديدة + تحسينان

### 📖 القرآن المترجم — تجميع الآيات في صفحات مصحف المدينة (مُدمج من v36)
- الآيات في صفحة السورة مجمَّعة تحت رقم صفحتها (٦٠٤ صفحات) مع كل خصائصها
  (التلاوة، التكرار، التفسير، الترجمة، الترنسليتيريشن، النسخ، المشاركة، المفضلة).
- شارة صفحة قابلة للنقر (الصفحة ن / ٦٠٤) تفتح المصحف الكامل على تلك الصفحة.
- سحب أفقي بين السور (متوافق RTL: لليمين = التالية، لليسار = السابقة).
- تكبير أرقام الآيات ﴿ ١ ﴾ بأرقام عربية-مشرقية ذهبية/زمردية تتبع حجم الخط.

### 🔎 بحث موحّد + فلتر السور/الأجزاء/الأحزاب/الأرباع (مُدمج من v36)
- خانة بحث واحدة: رقم صفحة (١-٦٠٤)، رقم/اسم سورة، مرجع سورة:آية، أو نص آية —
  مع دعم الأرقام العربية-المشرقية، وقائمة السور الثابتة لا تتأثر بالبحث.
- فلتر 🎛 للتبديل بين السور (١١٤) / الأجزاء (٣٠) / الأحزاب (٦٠) / الأرباع (٢٤٠)،
  يُحفَظ محلياً (quran_list_filter).

### ✨ تحسينان جديدان (v37)
- **نتائج البحث الموحّد أصبحت ورقة شبه كاملة الشاشة** (مع زر إغلاق وطبقة تغطية)
  بدل القائمة المنسدلة الصغيرة — أوضح وأسهل قراءة وتصفحاً.
- **بنود الأجزاء/الأحزاب/الأرباع تنقلك إلى القرآن المترجم** عند السورة والآية
  المناسبة (مع الترجمة والتفسير) بدل المصحف العربي الكامل.


## v1.0.35 — 2026-09-09 · Horarios EXACTOS de Muslim Pro en Jordania/Palestina + ajuste manual por oración (±60 min)

### 🔗 Sincronización con Muslim Pro reparada (causa raíz de las diferencias)
- Muslim Pro trasladó sus páginas de ciudad de `www.muslimpro.com/...` a
  `app.muslimpro.com/prayer-times/<pais>/<ciudad>/<id>`; la URL antigua devuelve 404
  ("Page not found") y la app estaba cayendo en silencio a Aladhan → de ahí las
  diferencias reportadas (≈6 min en Isha de Jordania, ±5 min en Shuruk/Maghrib de Palestina).
- `js/muslimpro-sync.js` y `backend/cloudflare-worker.js` actualizados al nuevo dominio
  y al nuevo formato de slug (se aceptan también los formatos antiguos). CSP del
  frontend y del Worker amplidas con `app.muslimpro.com`.
- Verificado en vivo (09-09-2026): Muslim Pro Amman 04:52/06:16/12:34/16:07/18:51/**20:21**,
  Nablus 04:56/06:19/12:36/16:09/18:53/20:12 → la app muestra los mismos números.

### 🇯🇴 Jordania — regla oficial del Ministerio de Awqaf (Isha = Maghrib + 90 min)
- Confirmado empíricamente: los horarios que publica Muslim Pro para Jordania cumplen
  Isha = Maghrib + 90 min exactos (18:51 + 90 = 20:21), la convención oficial jordana.
- Nuevo método de cálculo **19 "Min. de Awqaf de Jordania / وزارة الأوقاف الأردنية"**
  (Fajr 18°, Isha = Maghrib+90) disponible en Perfil → Método de cálculo.
- **Autodetección**: si la ubicación está en Jordania (por país o por coordenadas) y el
  usuario no ha elegido método manualmente, se usa el método 19 automáticamente.
- Red de seguridad: `PrayerCalc.applyRegionalCorrections()` fuerza Isha = Maghrib+90
  sobre cualquier fuente (Aladhan u offline) cuando el país es Jordania — incluso sin
  red ni Muslim Pro. Un ajuste manual del usuario sobre Isha tiene prioridad.

### 🇵🇸 Palestina — Shuruk y Maghrib alineados
- Con la sincronización reparada, Shuruk/Maghrib vuelven a ser los de Muslim Pro.
- Además la geocodificación inversa ahora se pide siempre **en inglés** a Nominatim
  (detección de país estable: "Jordan", "Palestinian Territory", …) independientemente
  del idioma de la app.

### 🎛️ Ajuste manual por oración (−60 … +60 min) — Perfil → "تعديل يدوي لمواقيت الصلاة"
- Nuevo ajuste `settings.prayerOffsets` (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha),
  con botones **− / +** de 1 minuto por oración, tope duro ±60 y botón de restablecer.
- Se aplica **encima de cualquier fuente** (Muslim Pro, Aladhan, cálculo offline) y de
  timeShift; al cambiarlo se reprograman las alarmas de adhan/recordatorios del día.
- Válido también en la vista mensual del calendario. i18n es/ar/en:
  `prayerAdjust`, `prayerAdjustDesc`, `prayerAdjustReset`, `prayerAdjustSaved`.

### ✅ Verificación (Node, TZ=Asia/Amman, 09-09-2026)
- Offline Amman (método 19): 04:53/06:16/12:34/16:07/18:51/20:21 — Isha−Maghrib = 90 min ✅
- Offline Nablus (MWL): 04:55/06:19/12:36/16:10/18:54/20:13 — ±1 min de Muslim Pro ✅
- Tests: prioridad del ajuste manual, clamp ±60, Palestina sin tocar, sintaxis OK en todos los archivos.

## v1.0.34 — 2026-09-06 · Horario dual + iconos rápidos a mitad de tamaño (Qibla en imagen + Cursos)

### 🖼️ Accesos rápidos del inicio (ahora 5, a mitad de tamaño)
- **Qibla** deja el icono Font Awesome y pasa a imagen realista propia
  (`assets/quick/qibla.png` — Kaaba sobre fondo verde, mismo estilo que el Corán/Du'as/Tasbih).
- Nuevo acceso **Cursos** (`assets/quick/courses.png` — libros + birrete) que lleva
  directo a `wisdom/courses`.
- Cuadrícula 4 → **5 columnas** con los iconos a **la mitad de tamaño** (ancho máx. 340px,
  esquinas 12px). `Skeleton.home()` actualizado a 5 celdas.

### 🕋➕ Horario secundario (franja de otra ciudad)
- Nueva franja compacta **debajo de la tabla de oraciones principal** del inicio
  (`js/dual-timing.js`): muestra Fajr→Isha en miniatura con el nombre de la ciudad.
- Sin ciudad configurada → botón **«+»** (Añadir horario de otra ciudad). Con ciudad →
  tocar el nombre o ✎ para **cambiar**, × para **eliminar**.
- Horas calculadas con PrayerCalc y **compensadas al huso horario de la ciudad**
  (mapa IANA por ciudad, incluye DST), no al del dispositivo.
- Ajuste propio en **Perfil → Horario secundario** (cambiar / quitar).

### 🌍 Lista de ciudades ampliada con buscador (`js/cities.js`, 92 ciudades)
- América Latina completa (capitales + ciudades principales), Europa, EE. UU./Canadá,
  Jordania, Palestina (incl. Al-Quds, Gaza, Ramala, Yaffa, Haifa, Al-Jalil), Golfo y Haramayn.
- Selector modal con **buscador** (latín y árabe, tolera acentos, hamza, taa marbuta y tashkeel)
  usado tanto por «Cambiar ciudad» (principal) como por el horario secundario.
- Nuevas claves i18n (es/ar/en): `chooseCity`, `searchCity`, `secondaryTiming`,
  `secondaryTimingDesc`, `secondaryNone`, `addSecondaryTiming`, `secondaryRemoved`,
  `removeSecondary`.

## v1.0.33 — 2026-09-06 · Inicio: accesos rápidos 1×1 con iconos realistas + cabecera compacta

### ✨ Nuevos accesos rápidos (estilo tarjetas con imagen realista + etiqueta)
- Nueva cuadrícula de 4 accesos directos **dentro de la cabecera verde** del inicio,
  justo debajo de la tarjeta de próxima oración: **Corán** (`assets/quick/quran.png`,
  imagen realista de un Corán verde con dorado), **Du'as** (`assets/quick/duas.png`,
  manos en súplica), **Tasbih** (`assets/quick/misbaha.png`, libro con misbaha) y
  **Qibla** (icono Font Awesome `fa-kaaba` dorado). Cada tarjeta es 1:1 con esquinas
  redondeadas, borde dorado sutil y etiqueta debajo, como en la referencia del usuario.
- Navegación: Corán → `quran`, Du'as → `wisdom/duas`, Tasbih → `wisdom/tasbih`,
  Qibla → `prayer` con `tab:'qibla'`.
- Nueva clave i18n `quickDuas` (es: "Du'as" / ar: "الأدعية" / en: "Du'as"); el resto
  reutiliza `tabQuran`, `tasbih`, `qibla` existentes.

### 📐 Cabecera más compacta (las oraciones se ven sin desplazarse)
- `.home-header`: padding vertical reducido (`sp-sm` arriba/abajo).
- `.next-prayer-card` en formato compacto: etiqueta + nombre + hora **en una sola línea**
  (inline) y cuenta atrás de 26px debajo; padding 8px 12px; margen superior `sp-sm`.
- `.home-top` más pequeño: saludo 18px, ubicación/hijri 12px, botón de perfil 30px.
- `.prayer-row`: padding 14px→8px, gap 14px→10px (filas más cortas).
- `.home-cta-row`: ya no se superpone con margen negativo; `margin-top: sp-sm`,
  padding de botones 12px→8px.
- Se retiró la línea de iqamah de las filas de la home para compactar
  (sigue disponible en la pestaña Oración).
- `Skeleton.home()` actualizado: replica la tarjeta compacta y la cuadrícula 4×1 de
  accesos rápidos mientras cargan los datos.

## v1.0.32 — 2026-09-06 · FIX raíz: Service Worker heredado bloqueaba TODOS los fixes (García incluido)

### 🧹 FIX crítico — traducción/tafsir de Isa García "no se actualizaba"
- **Causa raíz real**: no era la lógica de traducción (ya corregida en v29-v32) —
  era que la app tuvo Service Worker + `manifest.json` hasta la limpieza PWA
  reciente. Cualquier dispositivo que hubiera instalado la app como PWA (o un
  APK generado con PWA Builder/Bubblewrap, que empaqueta esa misma URL) se
  quedó con ese Service Worker **activo**, sirviendo desde su Cache Storage
  el `index.html`/JS antiguos (anteriores a `garcia-data.js` y a los fixes
  v29-v32) — sin importar cuántas veces se corrigiera o resubiera el código,
  porque el navegador nunca vuelve a pedir esos archivos por red mientras ese
  SW siga activo. Borrar `sw.js` del proyecto no desinstala el SW ya activo
  en los dispositivos existentes.
- **Fix**: nuevo script en `index.html` (se ejecuta en cada carga) que
  desregistra cualquier Service Worker restante y borra toda Cache Storage
  salvo `quba-quran-audio-v1` (audio del Corán, uso intencional y no
  relacionado con el SW). Efecto inmediato para visitantes nuevos; en un
  dispositivo con el SW ya activo puede necesitar una recarga adicional
  (el SW sigue controlando la carga en curso hasta que se recarga una vez
  desregistrado) — o borrar datos del sitio/app una vez manualmente para
  verlo al instante.
- `js/version.js`: `APP_VERSION` → `1.0.32` para poder confirmar desde
  Ajustes/Perfil si un dispositivo concreto ya recibió este build.

## v1.0.0 — 2026-09-04 · Correcciones: guardar audio en el dispositivo, PDF y copiar du'as
> **La versión pública de la app se mantiene en v1.0.0** (`js/version.js`, `package.json`, Ajustes/Perfil).

### 💾 FIX «Guardar en el dispositivo» (audio del Corán) — fallaba siempre
- **Causa raíz**: el CDN `cdn.islamic.network/quran/audio-surah/…` (MP3 de la sura completa) devuelve **403** desde mediados de 2026 → el botón «Guardar en el dispositivo» del gestor de audio mostraba `⚠️ Error` sin descargar nada.
- **Nueva cadena de descarga con fuentes verificadas** (todas responden 200 con CORS `*`):
  - **Plan A** — MP3 de la sura completa por recitador en `download.quranicaudio.com` (7 recitadores mapeados, incl. Maher al-Muaiqly año 1440 con respaldo 1422-1423).
  - **Plan B** — unión de las aleyas ya descargadas en la Cache API (MP3 MPEG-1 Layer III concatenables).
  - **Plan C** — descarga aleya por aleya con **triple reintento** (CDN 128k → CDN 64k → `everyayah.com`) y unión del resultado; lo descargado queda también offline en la Cache API.
- La descarga de suras del gestor usa ahora el mismo triple reintento — antes 3 de 7 recitadores (Sudais, Ghamdi, Abdul Basit) daban 403 a 128 kbps y la sura quedaba incompleta para siempre; ahora caen a 64 kbps o a everyayah automáticamente.
- Ventana de revocación del `blob:` URL ampliada de 4 s a 10 s (Safari/iOS y archivos grandes).
- CSP `connect-src` ampliado en `index.html` y en el Worker: `download.quranicaudio.com` + `everyayah.com`.

### 📄 FIX PDF de horarios de oración — nombre de la mezquita
- El encabezado y el pie del PDF (diario y mensual) mostraban «قباء»; ahora muestran **«قبة»** en todos los idiomas.

### 🤲 FIX copiar du'a — no copiaba nada
- **Causa raíz 1**: los ids del dataset local son STRING (`sayyid_istighfar`) y se inyectaban en `onclick` SIN comillas → `ReferenceError: sayyid_istighfar is not defined`. Ahora se inyectan escapados y entre comillas (`escapeJs`).
- **Causa raíz 2**: ids numéricos de la API cacheada antigua no encontraban la du'a al comparar con `===` contra strings. Ahora la búsqueda, marcadores y compartición comparan siempre como `String` (tolerante a tipos).
- El texto copiado se reconstruye desde la tarjeta visible → incluye la traducción ya aplicada en segundo plano (no la inglesa original).
- Copia robusta: Clipboard API con reintento y fallback `execCommand` ejecutado dentro del gesto del usuario (HTTP antiguos / WebViews).
- Compartir (`navigator.share`) con captura de cancelación; sin Web Share API cae a copiar.

## v1.1.0 — 2026-08-28 · Tafsir bajo demanda (APK 93% más ligero)

### 📦 APK más ligero — tafsir fuera del bundle
- **Eliminados los ~82 MB de JSON de tafsir que venían empaquetados** (`data/tafsir/al-i-rab-al-muyassar/`, `data/tafsir/en-tafsir-al-mukhtasar/`, `data/tafsir/spanish-mokhtasar/`). El tamaño del proyecto baja de **87 MB a ~5,9 MB** (~93% menos).
- El tafsir ahora se descarga desde el CDN público de `spa5k/tafsir_api` vía jsDelivr (`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/<slug>/<surah>.json`) — sin límites de uso, sin clave de API.

### 💾 Caché permanente en IndexedDB (igual que el Corán)
- Cada sura de tafsir se guarda una única vez en IndexedDB vía `CacheDB` **sin caducidad**. Primera lectura online, todas las siguientes sin conexión — mismo modelo que ya usa el texto del Corán desde v5.0.0.
- `TafsirService` reescrito (`CACHE_VER: 'v4'`): fetch → IndexedDB → memoria, con fallback a la sura árabe cuando el idioma es es/en para conservar la pestaña «Original en árabe».

### 🚀 Descarga automática al primer arranque — sin botón
- Al abrir la app por primera vez con conexión, `TafsirService.maybeAutoDownload()` empieza a descargar las 114 suras del tafsir del idioma actual en segundo plano (arranque diferido 2,5 s para no bloquear la UI). El usuario **no tiene que pulsar ningún botón de descarga** — igual que el prefetch de 14 días de horarios de oración.
- Idempotente: sura ya guardada se salta; si un JSON individual falla, se reintenta en el siguiente arranque.
- Respeta el modo de ahorro de datos del dispositivo (`navigator.connection.saveData`).
- Al recuperar conexión (`online` event), reanuda la descarga donde se había quedado.
- Manifiesto en `CacheDB` (`tafsir_offline_manifest_v1`) que registra por edición las suras ya completadas.

### 🔒 CSP ampliado
- Añadido `https://cdn.jsdelivr.net` a `connect-src` en `index.html` para permitir la descarga del tafsir desde el CDN.

### 🌍 Nuevos textos i18n (es/ar/en)
- `tafsirDownloading`, `tafsirDownloaded`, `tafsirDownloadPaused`.

### 🧹 Compatibilidad
- API pública de `TafsirService` intacta (`getTafsir`, `getAvailableTafsirs`, `clearCache`) — `pages/quran.js` y el botón de reintentar traducción siguen funcionando sin cambios.

## v1.0.0 — 2026-08-27 · Rendimiento y pulido

### 🦴 Skeleton loaders
- Todos los spinners reemplazados por barras grises tipo skeleton que replican el layout real de cada pantalla (Inicio, Oración, mensual, Calendario, Corán, lector, tafsir, Duas) — nuevo módulo `js/skeleton.js`.
- Splash: barras skeleton en lugar del spinner.

### 🎛️ Estados de UI completos
- `UIState` (en `js/skeleton.js`): estados de error con reintento, éxito y vacío, en los 3 idiomas; detecta sin conexión.
- Estados de error unificados en Inicio, Calendario, Corán y Duas.

### ⚡ Caché y ligereza
- `Storage` ahora tiene caché en memoria (Map): los datos se cargan una vez y la navegación entre pestañas es instantánea (sumado al IndexedDB de `cache-db.js` y los TTL existentes).
- Eliminado `dist/` (bundles sin referenciar) y scripts de build sin uso — app más ligera.

### 🧹 PWA eliminado
- Quitados `sw.js`, `manifest.json`, `js/pwa-install.js`, registro del service worker y CSS del banner; notificaciones ahora van directas vía API Notification.

### 🔧 Perfil
- Versión mostrada: **1.0.0** (`js/version.js`, `package.json`).
- Logo de la Mezquita Abdullah (`assets/mosque-logo.png`) al pie de la página de perfil.

## v5.0.0 — 2026-08-26 · Modo offline real (fusionado desde Quba v20.0 a Quba 2)

### 📴 Funcionamiento sin conexión (portado de v20.0)
- **Corán legible sin internet**: lista de las 114 suras vive local (`js/quran-offline.js`, IndexedDB permanente). El texto se guarda de forma permanente al leerlo una vez y la app descarga el Corán completo en segundo plano al detectar conexión. Banner con barra de progreso e insignias ✓ por sura en la pantalla del Corán. *Solo texto — el audio sigue requiriendo conexión.*
- **Horarios de oración sin internet**: motor de cálculo astronómico 100% local (`js/prayer-calc.js`) que se activa cuando no hay red ni caché (Inicio, pestaña de horarios y tabla mensual), marcado como «Horario aproximado (sin conexión)».
- **Calendario Hijri sin internet**: la conversión de un solo día cae al cálculo aritmético local si falla la red.
- **Inicio con "esqueleto" offline**: distingue "sin conexión" de "sin permiso de ubicación" y ofrece reintentar.
- **FIX crítico del app shell**: archivos que faltaban en la precarga del SW (`arabic_language.js`, `env.public.js`, `validate.js`, `glass-theme.css`, `restyle-layout.css`) añadidos — causaban fallos silenciosos sin conexión.
- **Fuentes e iconos offline**: Google Fonts y Font Awesome precargados y cacheados en runtime (condición de caché ampliada a CDN externos).
- **Avisos de conectividad**: aviso breve al perder/recuperar conexión en toda la app.
- **Nuevos textos i18n** (es/ar/en): offlineNowMsg, backOnlineMsg, estimatedTimes, downloadQuranOffline, quranDownloading, quranDownloaded, quranDownloadPaused, offlineHomeTitle, offlineHomeDesc.
- *Se conservan intactas las novedades propias de Quba 2 (tafsir local empaquetado, colecciones de adhkar extendidas, precache de tafsir JSON, etc.).*

## v4.9.2 — 2026-08-23 · Correcciones solicitadas por el Masjid (fadal, Eid, Iqamah, Jumuah, Adhan)

### 📅 Calendario Hijri
- **FIX fadal del día desfasado**: `getCalendarInfo()` parseaba 'YYYY-MM-DD' como medianoche UTC → en La Habana (UTC-4) retrocedía al día anterior (el fadal del viernes aparecía el sábado). Ahora parsea como fecha local al mediodía.
- **Icono de Eid al-Fitr**: sustituido `fa-champagne-glasses` (copa de champán, inapropiada) por `fa-star-and-crescent` (هلال ونجمة).

### 🕌 Oración
- **Iqamah por oración**: Fajr +20 · Dhuhr +15 · Asr +15 · Maghrib +5 · Isha +15. Visible en Inicio, pestaña de horarios y tabla mensual.
- **Aviso urgente de Jumuah**: al seleccionar un viernes en el calendario se muestra la nota «صلاة الجمعة على الساعة 2:10 بتوقيت هافانا».

### 🔊 Adhan
- **FIX reproducción**: URLs antiguas (cdn.islamic.network) devuelven 403. Nuevas fuentes verificadas (cdn.aladhan.com + islamcan.com) con fallback automático por voz.
- CSP `media-src` actualizado; settings (voces, volumen, silencio) intactos.

## v4.2.0 — 2026-07-10 · Long-term Architecture (v11)

### 🏗️ Infrastructure
- **Cloudflare Worker backend** (`backend/cloudflare-worker.js`) — proxy con KV cache para MyMemory, UmmahAPI, Nominatim. 100.000 req/día gratis, cache 30 días para traducciones.
- **Bundler simple** (`build/bundle.js`) — genera `dist/core.bundle.js`, `dist/data.bundle.js`, `dist/pages.bundle.js`. Reduce 51 requests HTTP a 3. Total: 464 KB.
- **TypeScript declarations** (`types/quba.d.ts`) — IntelliSense en VS Code sin migrar código. Compatible con `checkJs: true`.
- **Playwright test suite** (`tests/smoke.spec.js`) — 10 tests: home, CSP, wisdom, SW, manifest, escapeHtml, i18n parity, services, LocalDuas, Router pushState.

### 📿 Dataset Local Vetado
- **`data/duas/local_duas.js`** — 10 categorías, 15+ du'as auténticas con referencias explícitas (Bukhari, Muslim, Abu Dawud, Tirmidhi, Corán).
- Reemplaza dependencia de UmmahAPI unofficial → `CONFIG.USE_LOCAL_DUAS = true` por defecto.
- API compatible con estructura anterior (drop-in replacement).
- Marca `@theological_review PENDIENTE` para revisión formal por imám cualificado.

### 🔧 Config
- `CONFIG.API.PROXY` — endpoint del backend Worker (vacío por defecto).
- `CONFIG.USE_LOCAL_DUAS` — usa dataset local en lugar de UmmahAPI.
- Fallback en cascada: Local → Proxy → UmmahAPI directo.

### 📦 Estadísticas v11
- ZIP: 3.9 MB (114 archivos + `dist/` opcional + `backend/` + `types/` + `tests/`).
- 51 archivos JS válidos.
- SW: 4.2.0, 101 assets cacheados.
- i18n: 283 claves × 3 idiomas (paridad total).
- Bundles: 3 archivos, 464 KB total.

---

## v4.1.0 — 2026-07-09 · Priority Media (v10)
- IndexedDB (`js/cache-db.js`), WakeLock, PWA install banner, event delegation, WebP images, reset progress, export data.

## v4.0.0 — 2026-07-07 · Critical Fixes (v9)
- Global `escapeHtml`, CSP meta, SRI, Router `history.pushState`, language bug fix, splash reactivo, prayer notifications, accessibility CSS.

## v3.0.0 — Curso de Salah completo, 11 imágenes de posiciones, 26 lecciones.

## v2.0.0 — Adhkar page, Tasbih, Quiz gamificado con 305 preguntas.

## v1.0.0 — Lector Corán, oraciones, Qibla, calendario hijri.

## v1.0.39 (2026-09-12)
- دمج جميع إصلاحات مواقيت الصلاة على النسخة المحدثة: slugs مسلم برو الرسمية (mp-cities.js)، المطابقة لأقرب مدينة، طريقة الحساب الفعلية حسب البلد، مسح ذاكرة المواقيت عند تغيير المدينة، زر الموقع يفتح منتقي المدينة، والعد التنازلي «الوقت المتبقي» في الرئيسية وصفحة الصلاة.
- إصلاح: التعديل اليدوي (±دقائق) لم يكن ينعكس على المواقيت — أصبح يُطبَّق مباشرة على بيانات Muslim Pro والذاكرة المؤقتة والجدول الشهري والتوقيت الثانوي، مع تصفير فوري للمواقيت المعروضة.
- الإعدادات: قسم «تعديل يدوي لمواقيت الصلاة» أصبح بنداً واحداً بسهم صغير ينسدل لعرض الصلوات الست للتعديل.

## v1.0.57 — 2026-09-19 — مقتطفات دينية (فيديوهات يوتيوب داخل التطبيق)
- **جديد**: قسم «مقتطفات دينية» في الصفحة الرئيسية تحت الراديو الإسلامي مباشرة — بطاقتان مصغّرتان تتناوبان أسبوعيًا + زر «الكل».
- **جديد**: صفحة كاملة `videos` (شبكة فيديوهات + تبويب قوائم التشغيل) مع مشغّل يوتيوب مدمج داخل التطبيق (ملء الشاشة، CC، جودة) عبر `youtube-nocookie.com`.
- **جديد**: بطاقة «مقتطفات دينية» في صفحة الحكمة للوصول السريع.
- **بيانات**: 13 فيديو مبدئي + قائمتا تشغيل (القرآن بالترجمة الإسبانية المكتوبة والصوتية) في `js/videos-data.js` — نصوص واجهة AR/ES/EN.
- **CSP**: إضافة `frame-src`/`child-src` ليوتيوب + `youtube-nocookie` إلى `connect-src`.
- **ملفات جديدة**: `pages/videos.js`, `css/clips.css`, `js/videos-data.js` — ومزامنة قائمة الكاش في `sw.js`.
