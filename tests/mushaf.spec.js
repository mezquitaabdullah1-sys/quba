// 🧪 اختبارات المصحف: عكس اتجاه السحب + فهرس التجزئة (سور/أجزاء/أحزاب/أرباع) + بحث موحّد
const { test, expect } = require('@playwright/test');

async function openMushaf(page) {
  await page.goto('/#/mushaf?page=5');
  await page.waitForSelector('#msh-page', { timeout: 15000 });
}

test.describe('المصحف — اتجاه السحب والحركة', () => {
  test('السحب إلى اليمين = الصفحة التالية، والسحب إلى اليسار = السابقة', async ({ page }) => {
    await openMushaf(page);
    const indicator = page.locator('.msh-page-indicator');
    await expect(indicator).toContainText('٥');

    // سحب لليمين (من اليسار نحو اليمين) → تقدّم إلى صفحة ٦
    await page.locator('#msh-page').dispatchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 300, identifier: 1 }],
    });
    await page.locator('#msh-page').dispatchEvent('touchend', {
      changedTouches: [{ clientX: 220, clientY: 302, identifier: 1 }],
    });
    await expect(indicator).toContainText('٦', { timeout: 3000 });

    // سحب لليسار → رجوع إلى صفحة ٥
    await page.locator('#msh-page').dispatchEvent('touchstart', {
      touches: [{ clientX: 300, clientY: 300, identifier: 1 }],
    });
    await page.locator('#msh-page').dispatchEvent('touchend', {
      changedTouches: [{ clientX: 180, clientY: 301, identifier: 1 }],
    });
    await expect(indicator).toContainText('٥', { timeout: 3000 });
  });

  test('الانتقال بين الصفحات بحركة انزلاق (يوجد مسار الحركة مؤقتًا)', async ({ page }) => {
    await openMushaf(page);
    await page.locator('.msh-nav-btn >> nth=1').click(); // التالية
    // أثناء الحركة أو بعدها مباشرة يجب أن نصل إلى صفحة ٦ بدون كسر الصفحة
    await expect(page.locator('.msh-page-indicator')).toContainText('٦');
    await expect(page.locator('#msh-page')).toBeVisible();
  });
});

test.describe('المصحف — فهرس ☰ والتجزئة', () => {
  test('زر الثلاث خطوط يفتح الفهرس بأربعة تبويبات', async ({ page }) => {
    await openMushaf(page);
    await page.locator('button[title]').filter({ has: page.locator('.fa-bars') }).click();
    await page.waitForSelector('#msh-picker-tabs');
    const tabs = page.locator('#msh-picker-tabs .msh-tab');
    await expect(tabs).toHaveCount(4);
    // التبويب الافتراضي: السور — تظهر ١١٤ سورة
    await expect(page.locator('#msh-picker-list .picker-item')).toHaveCount(114);
  });

  test('تبويب الأجزاء يعرض ٣٠ جزءًا والأحزاب ٦٠ والأرباع ٢٤٠', async ({ page }) => {
    await openMushaf(page);
    await page.locator('.fa-bars').first().click();
    await page.waitForSelector('#msh-picker-tabs');

    await page.locator('.msh-tab[data-mode="juz"]').click();
    await expect(page.locator('#msh-picker-list .picker-item')).toHaveCount(30);

    await page.locator('.msh-tab[data-mode="hizb"]').click();
    await expect(page.locator('#msh-picker-list .picker-item')).toHaveCount(60);

    await page.locator('.msh-tab[data-mode="rub"]').click();
    await expect(page.locator('#msh-picker-list .picker-item')).toHaveCount(240);
  });

  test('اختيار الجزء ٣٠ ينقل إلى صفحة ٥٨٢', async ({ page }) => {
    await openMushaf(page);
    await page.locator('.fa-bars').first().click();
    await page.waitForSelector('#msh-picker-tabs');
    await page.locator('.msh-tab[data-mode="juz"]').click();
    await page.locator('#msh-picker-list .picker-item').last().click();
    await expect(page.locator('.msh-page-indicator')).toContainText('٥٨٢');
  });

  test('البحث برقم صفحة ينتقل إليها مباشرة', async ({ page }) => {
    await openMushaf(page);
    await page.locator('.fa-bars').first().click();
    await page.waitForSelector('#msh-picker-input');
    await page.fill('#msh-picker-input', '100');
    await page.locator('.picker-search .btn-primary').click();
    await expect(page.locator('.msh-page-indicator')).toContainText('١٠٠');
  });

  test('البحث بمرجع آية (٢:٢٥٥) ينتقل لصفحة آية الكرسي ٤٢', async ({ page }) => {
    await openMushaf(page);
    await page.locator('.fa-bars').first().click();
    await page.waitForSelector('#msh-picker-input');
    await page.fill('#msh-picker-input', '2:255');
    await page.locator('.picker-search .btn-primary').click();
    await expect(page.locator('.msh-page-indicator')).toContainText('٤٢');
  });

  test('البحث النصي يعرض نتائج آيات فوق القائمة', async ({ page }) => {
    await openMushaf(page);
    await page.locator('.fa-bars').first().click();
    await page.waitForSelector('#msh-picker-input');
    await page.fill('#msh-picker-input', 'الرحمن');
    await page.waitForSelector('.msh-picker-section', { timeout: 5000 });
    const first = page.locator('#msh-picker-list .picker-item').first();
    await expect(first).toBeVisible();
  });
});
