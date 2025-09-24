# 🎉 راهنمای نصب نهایی سرور MCP Cursor

## ✅ **سرور MCP کاملاً مطابق با استانداردهای Cursor**

سرور MCP حالا کاملاً مطابق با مستندات رسمی Cursor و لینک‌های نصب پیاده‌سازی شده است.

## 🚀 **نصب آسان با لینک Cursor**

### روش 1: نصب با لینک (پیشنهادی)
1. **باز کردن فایل نصب**: `cursor-install.html` را در مرورگر باز کنید
2. **کلیک روی دکمه نصب**: "📥 Install Cursor MCP Server" را کلیک کنید
3. **تأیید نصب**: Cursor از شما می‌خواهد سرور را نصب کنید
4. **راه‌اندازی مجدد**: Cursor را مجدداً راه‌اندازی کنید

### روش 2: نصب دستی
1. باز کردن Cursor
2. `Ctrl+Shift+P` (ویندوز) یا `Cmd+Shift+P` (مک)
3. تایپ "Preferences: Open Settings (JSON)"
4. اضافه کردن تنظیمات از `cursor-mcp-config.json`

## 🔗 **لینک نصب Cursor**
```
cursor://anysphere.cursor-deeplink/mcp/install?name=cursor-mcp-server&config=ewogICIkc2NoZW1hIjogImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9tb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXJzL21haW4vbWNwLmpzb24iLAogICJtY3BTZXJ2ZXJzIjogewogICAgImN1cnNvci1tY3Atc2VydmVyIjogewogICAgICAiY29tbWFuZCI6ICJub2RlIiwKICAgICAgImFyZ3MiOiBbCiAgICAgICAgIi4vY3Vyc29yLW1jcC1zZXJ2ZXIubWpzIgogICAgICBdLAogICAgICAiZW52IjogewogICAgICAgICJNRU1PUllfUEFUSCI6ICIuL2N1cnNvci1tZW1vcnkiLAogICAgICAgICJPVVRQVVRfUEFUSCI6ICIuL2N1cnNvci1vdXRwdXRzIgogICAgICB9LAogICAgICAiZGlzYWJsZWQiOiBmYWxzZSwKICAgICAgImF1dG9BcHByb3ZlIjogWwogICAgICAgICJyZWFkX2ZpbGUiLAogICAgICAgICJsaXN0X3Rvb2xzIiwKICAgICAgICAiY2FsbF90b29sIgogICAgICBdCiAgICB9CiAgfQp9
```

## 🛠️ **ابزارهای موجود**

### 1. **حافظه (Memory)**
- `store_memory` - ذخیره اطلاعات در حافظه
- `retrieve_memory` - بازیابی اطلاعات از حافظه
- `list_memory` - لیست تمام اطلاعات حافظه
- `delete_memory` - حذف اطلاعات از حافظه

### 2. **دستورات (Commands)**
- `execute_command` - اجرای دستور در سرور
- `create_component` - ساخت کامپوننت وب

## 🧪 **تست عملکرد**

### تست 1: ذخیره در حافظه
```
در حافظه ذخیره کن که من رنگ آبی را ترجیح می‌دهم
```

### تست 2: بازیابی از حافظه
```
ترجیحات من را از حافظه بخوان
```

### تست 3: ساخت کامپوننت
```
یک دکمه قرمز با متن "تست" بساز
```

### تست 4: اجرای دستور
```
یک کارت با عنوان "خدمات ما" بساز
```

## 📁 **فایل‌های ایجاد شده**

1. **`cursor-mcp-server.mjs`** - سرور MCP اصلی
2. **`cursor-mcp-config.json`** - تنظیمات Cursor
3. **`cursor-install.html`** - صفحه نصب وب
4. **`cursor-install-link.txt`** - لینک نصب
5. **`create-cursor-install-link.js`** - اسکریپت ایجاد لینک

## 🎯 **مثال‌های استفاده**

### ذخیره ترجیحات:
```
در حافظه ذخیره کن:
- زبان: فارسی
- تم: مدرن
- رنگ اصلی: #667eea
- رنگ ثانویه: #764ba2
```

### بازیابی اطلاعات:
```
ترجیحات من را از حافظه بخوان
```

### ساخت کامپوننت:
```
یک فرم تماس با فیلدهای نام، ایمیل و پیام بساز
```

### اجرای دستور:
```
یک صفحه فرود با عنوان "شرکت من" بساز
```

## 🔧 **تنظیمات سرور**

### متغیرهای محیطی:
- `MEMORY_PATH` - مسیر ذخیره حافظه (پیش‌فرض: `./cursor-memory`)
- `OUTPUT_PATH` - مسیر فایل‌های تولید شده (پیش‌فرض: `./cursor-outputs`)

### قابلیت‌ها:
- ✅ **حافظه پایدار** - اطلاعات در فایل ذخیره می‌شود
- ✅ **تشخیص زبان** - پشتیبانی فارسی/انگلیسی
- ✅ **ساخت کامپوننت** - دکمه، کارت، فرم، صفحه
- ✅ **اجرای دستور** - دستورات سفارشی
- ✅ **مدیریت ترجیحات** - ذخیره و بازیابی تنظیمات

## 📊 **نتایج تست**

```
🧪 Testing Cursor MCP Server...

✅ Server startup - Success
✅ Memory storage - Success
✅ Memory retrieval - Success
✅ Component creation - Success
✅ Command execution - Success

📊 Test Results: 5/5 passed
🎉 All tests passed! MCP server is working correctly.
```

## 🎉 **نتیجه‌گیری**

سرور MCP حالا کاملاً مطابق با استانداردهای Cursor پیاده‌سازی شده و شامل:

- ✅ **لینک نصب Cursor** - مطابق با فرمت رسمی
- ✅ **تنظیمات Base64** - کدگذاری صحیح
- ✅ **حافظه پایدار** - ذخیره و بازیابی اطلاعات
- ✅ **اجرای دستورات** - دستورات سفارشی
- ✅ **ساخت کامپوننت** - المان‌های وب
- ✅ **پشتیبانی فارسی** - تشخیص خودکار زبان

**همه چیز آماده نصب و استفاده در Cursor است!** 🚀

---

**نکته مهم**: این سرور MCP حالا واقعاً کار می‌کند و می‌توانید از طریق Cursor با آن تعامل داشته باشید و در حافظه‌اش ذخیره کنید!
