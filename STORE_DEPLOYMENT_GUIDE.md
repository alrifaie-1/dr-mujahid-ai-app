# دليل نشر التطبيق على Google Play و App Store

## نظرة عامة

هذا الدليل يشرح كيفية نشر تطبيق "د. مجاهد للذكاء الاصطناعي" على متجر Google Play و App Store باستخدام Expo EAS Build.

## المتطلبات الأساسية

### 1. حساب Expo
- إنشاء حساب على [expo.dev](https://expo.dev)
- تثبيت Expo CLI: `npm install -g @expo/cli`
- تثبيت EAS CLI: `npm install -g eas-cli`

### 2. حسابات المطورين
- **Google Play Console**: حساب مطور Google Play ($25 رسوم لمرة واحدة)
- **Apple Developer Program**: حساب مطور Apple ($99/سنة)

## إعداد المشروع

### 1. تسجيل الدخول إلى Expo
```bash
expo login
eas login
```

### 2. ربط المشروع
```bash
cd dr-mujahid-ai-app
eas build:configure
```

### 3. تحديث معرف المشروع
في ملف `app.json`، قم بتحديث:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    }
  }
}
```

## النشر على Google Play Store

### 1. إنشاء مفتاح التوقيع
```bash
eas credentials
```
اختر "Android" ثم "Generate new keystore"

### 2. بناء التطبيق لـ Android
```bash
# للاختبار
eas build --platform android --profile preview

# للإنتاج
eas build --platform android --profile production
```

### 3. إعداد Google Play Console

#### أ. إنشاء التطبيق
1. اذهب إلى [Google Play Console](https://play.google.com/console)
2. انقر "Create app"
3. املأ المعلومات:
   - **App name**: د. مجاهد للذكاء الاصطناعي
   - **Default language**: العربية
   - **App or game**: App
   - **Free or paid**: Free

#### ب. رفع التطبيق
1. اذهب إلى "Release" > "Production"
2. انقر "Create new release"
3. ارفع ملف AAB المُنشأ من EAS Build
4. املأ معلومات الإصدار

#### ج. معلومات المتجر
1. **App details**:
   - Short description: تطبيق ذكاء اصطناعي شامل لإنتاج المحتوى
   - Full description: (انظر النص أدناه)

2. **Graphics**:
   - App icon: 512x512 px
   - Feature graphic: 1024x500 px
   - Screenshots: على الأقل 2 لكل نوع جهاز

3. **Categorization**:
   - Category: Productivity
   - Tags: AI, Video, Certificates, Content Creation

#### د. سياسة المحتوى
1. املأ استبيان المحتوى
2. أضف سياسة الخصوصية
3. حدد الفئة العمرية المستهدفة

### 4. مراجعة ونشر
1. راجع جميع الأقسام
2. اضغط "Send for review"
3. انتظر الموافقة (عادة 1-3 أيام)

## النشر على App Store

### 1. إعداد Apple Developer
1. انضم إلى Apple Developer Program
2. احصل على Team ID من developer.apple.com

### 2. إنشاء App Store Connect App
1. اذهب إلى [App Store Connect](https://appstoreconnect.apple.com)
2. انقر "My Apps" > "+"
3. املأ المعلومات:
   - **Name**: د. مجاهد للذكاء الاصطناعي
   - **Bundle ID**: com.drmujahid.aiapp
   - **SKU**: dr-mujahid-ai-app-001

### 3. بناء التطبيق لـ iOS
```bash
# للاختبار
eas build --platform ios --profile preview

# للإنتاج
eas build --platform ios --profile production
```

### 4. رفع التطبيق
```bash
eas submit --platform ios --profile production
```

### 5. معلومات App Store

#### أ. App Information
- **Name**: د. مجاهد للذكاء الاصطناعي
- **Subtitle**: تطبيق ذكاء اصطناعي شامل
- **Category**: Productivity
- **Content Rights**: لا يحتوي على محتوى محمي بحقوق الطبع

#### ب. Pricing and Availability
- **Price**: Free
- **Availability**: جميع البلدان

#### ج. App Store Information
- **Description**: (انظر النص أدناه)
- **Keywords**: ذكاء اصطناعي,فيديو,شهادات,تصميم,محتوى
- **Support URL**: https://dr-mujahid-ai.com/support
- **Marketing URL**: https://dr-mujahid-ai.com

#### د. App Review Information
- **Notes**: تطبيق ذكاء اصطناعي لإنتاج المحتوى وتصميم الشهادات
- **Contact Information**: معلومات الاتصال الخاصة بك

### 6. Screenshots والميديا
- **iPhone Screenshots**: 6.7", 6.5", 5.5"
- **iPad Screenshots**: 12.9", 11"
- **App Preview Videos**: اختياري لكن مُوصى به

### 7. مراجعة ونشر
1. اضغط "Submit for Review"
2. انتظر المراجعة (عادة 24-48 ساعة)
3. بعد الموافقة، سيتم نشر التطبيق تلقائياً

## نصوص المتجر

### الوصف الكامل (Google Play & App Store)

**العربية:**
```
تطبيق د. مجاهد للذكاء الاصطناعي - تطبيق شامل ومتطور يجمع بين قوة الذكاء الاصطناعي وسهولة الاستخدام لإنتاج محتوى رقمي احترافي.

🎬 إنتاج الفيديوهات:
• تحويل النصوص إلى فيديوهات احترافية
• تحريك الصور بتأثيرات مذهلة
• إلقاء شعري احترافي بالذكاء الاصطناعي
• إنتاج أفلام قصيرة من السيناريوهات

🏆 تصميم الشهادات:
• إنشاء شهادات تقدير وإنجاز مخصصة
• شهادات متعددة للطلاب والموظفين
• 4 قوالب احترافية متنوعة
• إضافة الصور والتوقيعات والأختام

🖼️ معالجة الصور:
• تحسين الصور بالذكاء الاصطناعي
• استديو تصوير احترافي
• خلفيات وتأثيرات متنوعة

📄 إنشاء المستندات:
• صانع السيرة الذاتية الاحترافي
• قوالب متنوعة وقابلة للتخصيص

الميزات الرئيسية:
✅ واجهة عربية سهلة الاستخدام
✅ ذكاء اصطناعي متطور
✅ جودة عالية للمخرجات
✅ مشاركة سريعة ومباشرة
✅ حفظ تلقائي للمشاريع

مثالي للمعلمين والطلاب والموظفين والمؤسسات التعليمية والشركات وصناع المحتوى.

حمل التطبيق الآن واكتشف قوة الذكاء الاصطناعي في إنتاج المحتوى!
```

### الوصف القصير (Google Play)
```
تطبيق ذكاء اصطناعي شامل لإنتاج الفيديوهات وتصميم الشهادات والمحتوى الرقمي
```

## الكلمات المفتاحية

### Google Play
- ذكاء اصطناعي
- إنتاج فيديو
- تصميم شهادات
- محتوى رقمي
- تحرير صور

### App Store
```
ذكاء اصطناعي,فيديو,شهادات,تصميم,محتوى,تحرير,صور,إنتاج,رقمي,احترافي
```

## متطلبات الصور والرسوميات

### أيقونة التطبيق
- **Android**: 512x512 px (PNG)
- **iOS**: 1024x1024 px (PNG)

### Screenshots
- **Android**: 1080x1920 px أو 1080x2340 px
- **iOS**: أحجام مختلفة حسب الجهاز

### Feature Graphic (Android)
- **الحجم**: 1024x500 px
- **التنسيق**: PNG أو JPEG

## نصائح للموافقة السريعة

### Google Play
1. تأكد من امتثال التطبيق لسياسات Google Play
2. اختبر التطبيق جيداً قبل الرفع
3. املأ جميع المعلومات المطلوبة
4. أضف وصف واضح ومفصل

### App Store
1. اتبع Human Interface Guidelines
2. تأكد من عمل جميع الميزات
3. أضف screenshots عالية الجودة
4. املأ معلومات App Review بدقة

## الأوامر المفيدة

### بناء التطبيق
```bash
# Android (تطوير)
eas build --platform android --profile development

# Android (إنتاج)
eas build --platform android --profile production

# iOS (تطوير)
eas build --platform ios --profile development

# iOS (إنتاج)
eas build --platform ios --profile production

# كلا المنصتين
eas build --platform all --profile production
```

### رفع التطبيق
```bash
# Android
eas submit --platform android --profile production

# iOS
eas submit --platform ios --profile production

# كلا المنصتين
eas submit --platform all --profile production
```

### مراقبة البناء
```bash
eas build:list
eas build:view [build-id]
```

## استكشاف الأخطاء

### مشاكل شائعة
1. **خطأ في التوقيع**: تأكد من إعداد credentials بشكل صحيح
2. **فشل البناء**: راجع logs البناء في Expo dashboard
3. **رفض المتجر**: راجع سياسات المتجر والتزم بها

### الحصول على المساعدة
- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

---

**ملاحظة**: تأكد من تحديث جميع المعرفات والمسارات في الملفات قبل البناء والنشر.

