# 🚀 راهنمای کامل سرور MCP فارسی

## 📋 قابلیت‌های کامل سرور MCP

### ✅ **تمام قابلیت‌های MCP SDK پوشش داده شده:**

1. **🔧 Tools (ابزارها)**
   - `create_element` - ساخت المان‌های UI
   - `memory_operation` - عملیات حافظه
   - `code_generation` - تولید کد
   - `file_operation` - عملیات فایل

2. **📝 Prompts (پیش‌فرم‌ها)**
   - `create_ui_element` - راهنمای ساخت المان UI
   - `generate_code` - راهنمای تولید کد

3. **📚 Resources (منابع)**
   - `memory://data` - داده‌های حافظه
   - `templates://ui` - قالب‌های UI
   - `config://settings` - تنظیمات سیستم

4. **📊 Logging (ثبت رویدادها)**
   - ثبت کامل تمام عملیات
   - سطوح مختلف لاگ (INFO, ERROR, WARNING)

5. **💬 Completions (تکمیل خودکار)**
   - پیشنهادات هوشمند
   - تکمیل بر اساس ورودی کاربر

## 🎯 نحوه استفاده توسط Cursor

### **1. ساخت المان‌های UI**

```javascript
// Cursor می‌تواند این درخواست‌ها را ارسال کند:

// ساخت دکمه
{
  "name": "create_element",
  "arguments": {
    "type": "button",
    "content": {
      "text": "دکمه من",
      "color": "#667eea",
      "size": "large"
    },
    "style": "modern",
    "responsive": true
  }
}

// ساخت هدر
{
  "name": "create_element",
  "arguments": {
    "type": "header",
    "content": {
      "title": "عنوان سایت",
      "subtitle": "توضیحات"
    },
    "style": "glassmorphism"
  }
}

// ساخت کارت
{
  "name": "create_element",
  "arguments": {
    "type": "card",
    "content": {
      "title": "کارت محصول",
      "description": "توضیحات محصول"
    }
  }
}

// ساخت فرم
{
  "name": "create_element",
  "arguments": {
    "type": "form",
    "content": {
      "title": "فرم تماس",
      "fields": [
        {"name": "name", "label": "نام", "type": "text", "required": true},
        {"name": "email", "label": "ایمیل", "type": "email", "required": true}
      ]
    }
  }
}

// ساخت صفحه کامل
{
  "name": "create_element",
  "arguments": {
    "type": "page",
    "content": {
      "title": "صفحه اصلی",
      "sections": ["hero", "content", "footer"]
    }
  }
}
```

### **2. عملیات حافظه**

```javascript
// ذخیره در حافظه
{
  "name": "memory_operation",
  "arguments": {
    "action": "save",
    "content": "پروژه فروشگاه آنلاین",
    "category": "projects"
  }
}

// بازیابی از حافظه
{
  "name": "memory_operation",
  "arguments": {
    "action": "recall",
    "content": "فروشگاه"
  }
}

// لیست حافظه
{
  "name": "memory_operation",
  "arguments": {
    "action": "list"
  }
}

// حذف از حافظه
{
  "name": "memory_operation",
  "arguments": {
    "action": "forget",
    "content": "پروژه قدیمی"
  }
}
```

### **3. تولید کد**

```javascript
// تولید کد JavaScript
{
  "name": "code_generation",
  "arguments": {
    "language": "javascript",
    "functionality": "button",
    "requirements": {
      "interactive": true,
      "animations": true
    }
  }
}

// تولید کد CSS
{
  "name": "code_generation",
  "arguments": {
    "language": "css",
    "functionality": "modern",
    "requirements": {
      "responsive": true,
      "variables": true
    }
  }
}
```

### **4. عملیات فایل**

```javascript
// خواندن فایل
{
  "name": "file_operation",
  "arguments": {
    "operation": "read",
    "path": "./example.txt"
  }
}

// نوشتن فایل
{
  "name": "file_operation",
  "arguments": {
    "operation": "write",
    "path": "./new-file.txt",
    "content": "محتوای فایل جدید"
  }
}

// لیست فایل‌ها
{
  "name": "file_operation",
  "arguments": {
    "operation": "list",
    "path": "./"
  }
}

// حذف فایل
{
  "name": "file_operation",
  "arguments": {
    "operation": "delete",
    "path": "./old-file.txt"
  }
}
```

## 🎨 **استایل‌های پشتیبانی شده**

### **1. Modern (مدرن)**
- گرادیان‌های زیبا
- انیمیشن‌های نرم
- سایه‌های ظریف

### **2. Minimal (مینیمال)**
- طراحی ساده و تمیز
- رنگ‌های خنثی
- فضاهای سفید

### **3. Glassmorphism (شیشه‌ای)**
- شفافیت و بلور
- افکت blur
- رنگ‌های پاستلی

## 📱 **Responsive Design**

تمام المان‌ها به صورت خودکار responsive هستند:
- موبایل: عرض کامل
- تبلت: تنظیم اندازه
- دسکتاپ: اندازه بهینه

## 🔧 **پارامترهای هوشمند**

### **پارامترهای خودکار:**
- `timestamp` - زمان ایجاد
- `uuid` - شناسه یکتا
- `responsive` - واکنش‌گرا بودن
- `accessibility` - دسترسی‌پذیری

### **پارامترهای قابل تنظیم:**
- `style` - سبک طراحی
- `color` - رنگ‌بندی
- `size` - اندازه
- `animation` - انیمیشن

## 📊 **مدیریت منابع**

### **منابع در دسترس:**
1. **Memory Data** (`memory://data`)
   - تمام داده‌های ذخیره شده
   - دسته‌بندی شده بر اساس category

2. **UI Templates** (`templates://ui`)
   - قالب‌های آماده HTML/CSS
   - قابل استفاده مجدد

3. **Configuration** (`config://settings`)
   - تنظیمات سرور
   - مسیرها و قابلیت‌ها

## 🚀 **مزایای سرور کامل**

### **1. سازگاری کامل با MCP**
- تمام قابلیت‌های SDK پوشش داده شده
- پشتیبانی از تمام پروتکل‌ها
- سازگاری با Cursor

### **2. هوشمندی در تشخیص**
- تشخیص خودکار نوع درخواست
- پیشنهادات هوشمند
- بهینه‌سازی توکن

### **3. انعطاف‌پذیری بالا**
- پارامترهای قابل تنظیم
- قابلیت توسعه
- پشتیبانی از چندین زبان

### **4. عملکرد بهینه**
- پردازش سریع
- مدیریت حافظه
- لاگ‌گیری کامل

## 🎯 **نحوه استفاده توسط Cursor**

### **درخواست‌های ساده:**
```
"یک دکمه آبی بساز"
"هدر مدرن برای سایت"
"فرم تماس با ما"
"کارت محصول زیبا"
```

### **درخواست‌های پیشرفته:**
```
"دکمه تعاملی با انیمیشن hover"
"فرم اعتبارسنجی با JavaScript"
"صفحه فرود responsive"
"کارت محصول با glassmorphism"
```

## 📁 **ساختار فایل‌ها**

```
cursor-memory/          # حافظه سیستم
├── projects.json       # پروژه‌ها
├── ideas.json         # ایده‌ها
└── general.json       # عمومی

cursor-outputs/         # خروجی‌ها
├── button-*.html      # دکمه‌ها
├── header-*.html      # هدرها
├── card-*.html        # کارت‌ها
├── form-*.html        # فرم‌ها
└── page-*.html        # صفحات

cursor-templates/       # قالب‌ها
└── ui-templates.html  # قالب‌های UI

cursor-resources/       # منابع
└── config.json        # تنظیمات
```

## 🔄 **نحوه راه‌اندازی**

1. **نصب وابستگی‌ها:**
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. **تنظیم Cursor:**
   - فایل `settings.json` به‌روزرسانی شده
   - سرور `complete-persian-mcp` فعال

3. **اجرای سرور:**
   ```bash
   node complete-mcp-server.js
   ```

4. **تست عملکرد:**
   - Cursor را ری‌استارت کنید
   - درخواست‌های مختلف ارسال کنید

## ✅ **تضمین کیفیت**

- ✅ تمام قابلیت‌های MCP پوشش داده شده
- ✅ سازگاری کامل با Cursor
- ✅ پشتیبانی از پارامترهای هوشمند
- ✅ مدیریت خطا و لاگ‌گیری
- ✅ عملکرد بهینه و سریع
- ✅ قابلیت توسعه و سفارشی‌سازی

---

**🎉 سرور MCP شما آماده است! Cursor حالا می‌تواند از تمام قابلیت‌های MCP استفاده کند و المان‌های UI زیبا و حرفه‌ای بسازد.**
