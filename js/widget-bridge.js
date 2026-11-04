// جسر ويدجتس الشاشة الرئيسية — يغلّف دوال Android الأصلية بأمان
window.WidgetBridge = {
  save(cfg) {
    try { if (window.Android && Android.saveWidgetConfig) Android.saveWidgetConfig(JSON.stringify(cfg)); } catch (e) {}
  },
  refresh() {
    try { if (window.Android && Android.refreshWidgets) Android.refreshWidgets(); } catch (e) {}
  },
  pin(kind) {
    try { if (window.Android && Android.pinWidget) Android.pinWidget(kind); } catch (e) {}
  }
};
