# دليل حل مشاكل البناء - Build Troubleshooting Guide

## 🔧 المشاكل الشائعة وحلولها

### ❌ مشكلة: "Resolve build configuration failed"

**السبب:**
- إعدادات EAS غير مكتملة
- مشكلة في ملف `eas.json`
- نقص في الصلاحيات أو التوكن

**الحل:**
1. **تحقق من ملف `eas.json`:**
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

2. **تحقق من التوكن:**
   - اذهب إلى: https://expo.dev/accounts/alrifaie.1/settings/access-tokens
   - تأكد من وجود توكن صالح
   - أضفه إلى GitHub Secrets باسم `EXPO_TOKEN`

3. **إعادة تشغيل البناء:**
```bash
eas build --platform android --profile preview --clear-cache
```

---

### ❌ مشكلة: GitHub Actions تفشل

**الأسباب المحتملة:**
- `EXPO_TOKEN` غير موجود في GitHub Secrets
- مشكلة في dependencies
- خطأ في workflow

**الحل:**
1. **إضافة EXPO_TOKEN:**
   - اذهب إلى: https://github.com/alrifaie-1/dr-mujahid-ai-app/settings/secrets/actions
   - أضف secret جديد: `EXPO_TOKEN`
   - القيمة: التوكن من Expo

2. **تحقق من package.json:**
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

---

### ❌ مشكلة: "Build failed with non-zero code"

**الحل:**
1. **تنظيف Cache:**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

2. **إعادة تكوين Expo:**
```bash
npx expo install --fix
```

3. **بناء محلي للاختبار:**
```bash
npx expo prebuild --clean
```

---

## 🚀 خطوات البناء الصحيحة

### 1. البناء المحلي (للاختبار):
```bash
# تنظيف المشروع
npm cache clean --force
rm -rf node_modules
npm install

# اختبار محلي
npx expo start

# بناء محلي
npx expo prebuild
```

### 2. البناء على Expo:
```bash
# بناء APK للاختبار
eas build --platform android --profile preview

# بناء للإنتاج
eas build --platform android --profile production
eas build --platform ios --profile production
```

### 3. النشر:
```bash
# نشر تحديث
eas update --auto

# رفع للمتاجر
eas submit --platform android
eas submit --platform ios
```

---

## 📱 روابط مهمة

- **Expo Dashboard:** https://expo.dev/accounts/alrifaie.1/projects/dr-mujahid-ai-app
- **GitHub Repository:** https://github.com/alrifaie-1/dr-mujahid-ai-app
- **Builds:** https://expo.dev/accounts/alrifaie.1/projects/dr-mujahid-ai-app/builds
- **Updates:** https://expo.dev/accounts/alrifaie.1/projects/dr-mujahid-ai-app/updates

---

## 🔍 فحص الحالة

### تحقق من حالة البناء:
1. اذهب إلى Expo Dashboard
2. تحقق من آخر builds
3. راجع logs للأخطاء

### تحقق من GitHub Actions:
1. اذهب إلى GitHub Repository
2. انقر على "Actions"
3. راجع آخر workflow runs

---

## 📞 الدعم

إذا استمرت المشاكل:
1. راجع Expo Documentation
2. تحقق من Community Forums
3. راجع GitHub Issues للمشروع

**آخر تحديث:** $(date)

