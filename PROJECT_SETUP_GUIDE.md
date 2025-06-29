# دليل إعداد مشروع د. مجاهد للذكاء الاصطناعي

## 🎉 تم إعداد المشروع بنجاح!

### 📍 روابط المشروع:

#### GitHub Repository:
**الرابط:** https://github.com/alrifaie-1/dr-mujahid-ai-app

#### Expo Project:
**معرف المشروع:** c04ab66e-ad9e-420f-b2c0-afadeaf410ae
**المالك:** alrifaie-1

---

## 🔧 إعدادات المطلوبة لإكمال النشر:

### 1. إعداد Expo Token في GitHub:
لتفعيل البناء التلقائي، تحتاج إلى إضافة Expo Token إلى GitHub Secrets:

1. **احصل على Expo Token:**
   - اذهب إلى https://expo.dev/accounts/alrifaie-1/settings/access-tokens
   - انقر "Create Token"
   - أعط التوكن اسماً مثل "GitHub Actions"
   - انسخ التوكن

2. **أضف التوكن إلى GitHub:**
   - اذهب إلى https://github.com/alrifaie-1/dr-mujahid-ai-app/settings/secrets/actions
   - انقر "New repository secret"
   - الاسم: `EXPO_TOKEN`
   - القيمة: التوكن الذي نسخته من Expo
   - انقر "Add secret"

### 2. إعداد EAS Build:
لبناء التطبيق للمتاجر:

1. **اذهب إلى Expo Dashboard:**
   - https://expo.dev/accounts/alrifaie-1/projects/dr-mujahid-ai-app

2. **ربط GitHub Repository:**
   - في صفحة المشروع، انقر "Connect GitHub"
   - اختر repository: alrifaie-1/dr-mujahid-ai-app
   - اختر branch: main

3. **إعداد Build Profiles:**
   - انقر "Builds" في الشريط الجانبي
   - انقر "Create build"
   - اختر Platform (Android/iOS)
   - اختر Build type (Development/Preview/Production)

---

## 🚀 كيفية البناء والنشر:

### البناء التلقائي:
- كل push إلى main branch سيؤدي إلى بناء تلقائي
- ستجد النتائج في GitHub Actions tab

### البناء اليدوي:
1. اذهب إلى https://expo.dev/accounts/alrifaie-1/projects/dr-mujahid-ai-app
2. انقر "Builds"
3. انقر "Create build"
4. اختر الإعدادات المطلوبة
5. انقر "Build"

---

## 📱 نشر التطبيق:

### Google Play Store:
1. بناء APK/AAB من Expo
2. تحميل إلى Google Play Console
3. اتباع عملية المراجعة

### Apple App Store:
1. بناء IPA من Expo
2. تحميل إلى App Store Connect
3. اتباع عملية المراجعة

---

## 🔄 التحديثات المستقبلية:

### تحديث الكود:
1. عدل الملفات محلياً أو في GitHub
2. اعمل commit و push
3. سيتم البناء تلقائياً

### تحديث التطبيق:
- استخدم `eas update` للتحديثات السريعة
- استخدم `eas build` للإصدارات الجديدة

---

## 📞 الدعم:
- **GitHub Issues:** https://github.com/alrifaie-1/dr-mujahid-ai-app/issues
- **Expo Documentation:** https://docs.expo.dev/
- **EAS Build Guide:** https://docs.expo.dev/build/introduction/

