# 🔧 دليل استكشاف الأخطاء - Troubleshooting Guide

## 🗺️ مشكلة: الخريطة لا تظهر

### الأسباب المحتملة والحلول:

#### 1️⃣ **مشكلة في الاتصال بالإنترنت**

**الأعراض:**
- شاشة بيضاء أو رمادية مكان الخريطة
- رسالة "Tile loading error" في Console

**الحل:**
```
✅ تحقق من اتصال الإنترنت
✅ جرب إعادة تحميل الصفحة (Ctrl+R أو Cmd+R)
✅ انتظر 5-10 ثوان للتحميل
```

---

#### 2️⃣ **Leaflet CSS غير محمّل**

**الأعراض:**
- الخريطة موجودة لكن التحكمات مكسورة
- الخريطة تظهر بدون أيقونات

**الحل:**
```html
<!-- تأكد من وجود هذا السطر في <head> -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

---

#### 3️⃣ **الخريطة بدون ارتفاع محدد**

**الأعراض:**
- عنصر الخريطة موجود لكن بارتفاع 0px
- في Developer Tools: `#map { height: 0px }`

**الحل:**
```css
#map {
    width: 100%;
    height: 100vh; /* أو أي ارتفاع محدد */
}

/* أو */
#map {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
```

---

#### 4️⃣ **JavaScript غير محمّل بشكل صحيح**

**الأعراض:**
- خطأ في Console: "L is not defined"
- الخريطة لا تتهيأ أبداً

**الحل:**
```html
<!-- تأكد من وجود Leaflet JS قبل كود التطبيق -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="app.js"></script> <!-- بعد Leaflet -->
```

---

#### 5️⃣ **العنصر #map غير موجود**

**الأعراض:**
- خطأ في Console: "Map container not found"

**الحل:**
```javascript
// تأكد من تشغيل الكود بعد تحميل DOM
window.onload = initApp;
// أو
document.addEventListener('DOMContentLoaded', initApp);
```

---

#### 6️⃣ **مشكلة في z-index**

**الأعراض:**
- الخريطة موجودة لكن مخفية خلف عناصر أخرى

**الحل:**
```css
#mapContainer {
    z-index: 1;
}

#map {
    z-index: 1;
}

/* العناصر الأخرى */
.stats-panel {
    z-index: 950;
}
```

---

## 🧪 كيف تختبر الخريطة:

### اختبار بسيط:

1. **افتح `test-map.html`** في المتصفح
2. إذا رأيت خريطة → ✅ Leaflet يعمل
3. إذا لم تظهر → المشكلة في المتصفح أو الاتصال

### اختبار في Console:

```javascript
// افتح Developer Tools (F12)
// اكتب في Console:

// 1. تحقق من وجود Leaflet
console.log(typeof L); // يجب أن يكون "object"

// 2. تحقق من عنصر الخريطة
console.log(document.getElementById('map')); // يجب أن يكون HTML element

// 3. تحقق من ارتفاع الخريطة
console.log(document.getElementById('map').offsetHeight); // يجب أن يكون > 0
```

---

## 🔍 فحص Console للأخطاء:

### افتح Developer Tools:

**في Chrome/Edge:**
- Windows: `F12` أو `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

**في Safari:**
- Mac: `Cmd + Option + C`

### ابحث عن:

```
❌ "Failed to load resource"
   → مشكلة في التحميل من CDN

❌ "L is not defined"
   → Leaflet.js غير محمّل

❌ "Map container not found"
   → عنصر #map غير موجود

❌ "Tile loading error"
   → مشكلة في الاتصال
```

---

## 🛠️ إصلاحات سريعة:

### إصلاح 1: Hard Refresh

```
Chrome/Edge: Ctrl + F5
Safari: Cmd + Shift + R
Firefox: Ctrl + Shift + R
```

### إصلاح 2: امسح الكاش

```
Chrome: Settings → Privacy → Clear browsing data
Safari: Develop → Empty Caches
Firefox: Options → Privacy → Clear Data
```

### إصلاح 3: جرب متصفح آخر

```
✅ Chrome/Edge - موصى به
✅ Safari - يعمل جيداً
✅ Firefox - يعمل
❓ Opera - يجب أن يعمل
```

---

## 📱 مشاكل الموبايل:

### iPhone/iPad:

**المشكلة:** الخريطة لا تظهر على Safari
**الحل:**
1. تأكد من تحديث iOS
2. أغلق التطبيقات الأخرى
3. جرب إعادة تشغيل Safari
4. امسح كاش Safari

### Android:

**المشكلة:** الخريطة بطيئة أو لا تظهر
**الحل:**
1. استخدم Chrome (ليس متصفح Samsung)
2. فعّل JavaScript في الإعدادات
3. امسح بيانات المتصفح

---

## 🚫 مشاكل GPS:

### GPS لا يعمل:

```
1. ✅ فعّل خدمات الموقع في الجهاز
2. ✅ امنح التطبيق إذن الموقع
3. ✅ اخرج للخارج (GPS ضعيف داخل المباني)
4. ✅ أعد تشغيل التطبيق
5. ✅ تأكد من تفعيل GPS/Location في الهاتف
```

### GPS غير دقيق:

```
1. انتظر 30-60 ثانية للحصول على إشارة قوية
2. تأكد من خيار "الدقة العالية" في الإعدادات
3. تجنب المناطق المغلقة
4. تأكد من عدم وجود عوائق (مباني عالية، أشجار كثيفة)
```

---

## 🌐 مشاكل HTTPS:

**المشكلة:** التطبيق لا يعمل على HTTP

**السبب:** متصفحات الموبايل تطلب HTTPS للـ:
- Geolocation API
- Service Workers
- PWA Features

**الحل:**
```
✅ استخدم GitHub Pages (HTTPS مجاني)
✅ أو Netlify/Vercel
✅ أو أي استضافة بـ SSL
✅ للاختبار المحلي: استخدم localhost (مسموح)
```

---

## 🔧 أدوات الفحص:

### 1. Leaflet Health Check

```javascript
// في Console
if (typeof L !== 'undefined') {
    console.log('✅ Leaflet loaded');
    console.log('Version:', L.version);
} else {
    console.log('❌ Leaflet not loaded');
}
```

### 2. Map Container Check

```javascript
const mapEl = document.getElementById('map');
if (mapEl) {
    console.log('✅ Map element exists');
    console.log('Width:', mapEl.offsetWidth);
    console.log('Height:', mapEl.offsetHeight);
    if (mapEl.offsetHeight === 0) {
        console.log('⚠️ Warning: Map height is 0!');
    }
} else {
    console.log('❌ Map element not found');
}
```

### 3. Geolocation Check

```javascript
if ("geolocation" in navigator) {
    console.log('✅ Geolocation supported');
    navigator.geolocation.getCurrentPosition(
        (pos) => console.log('✅ Got position:', pos.coords),
        (err) => console.log('❌ Error:', err.message)
    );
} else {
    console.log('❌ Geolocation not supported');
}
```

---

## 📞 لم تحل المشكلة؟

### احصل على المساعدة:

1. **افتح Issue على GitHub:**
   ```
   https://github.com/yourusername/desert-tracker/issues
   ```

2. **ضمّن المعلومات التالية:**
   ```
   - المتصفح والإصدار
   - نظام التشغيل
   - لقطة شاشة من Console (F12)
   - خطوات إعادة المشكلة
   ```

3. **أو راسلنا:**
   ```
   📧 support@deserttracker.ae
   💬 Discord: discord.gg/deserttracker
   ```

---

## ✅ Checklist كامل:

قبل طلب المساعدة، تحقق من:

- [ ] الإنترنت متصل
- [ ] HTTPS مفعّل (أو localhost)
- [ ] Leaflet CSS & JS محمّلين
- [ ] عنصر #map موجود
- [ ] #map له ارتفاع محدد
- [ ] لا أخطاء في Console
- [ ] GPS مفعّل ومسموح
- [ ] المتصفح محدّث
- [ ] جربت Hard Refresh
- [ ] جربت متصفح آخر

---

**معظم المشاكل تُحل بـ Hard Refresh + مسح الكاش! 💪**
