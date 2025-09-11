# Persian Legal AI Training System

<div align="center">
  <h1>🧠 سیستم آموزش هوش مصنوعی حقوقی ایران</h1>
  <p>آموزش مدل‌های هوش مصنوعی با دیتاست‌های واقعی قوانین جمهوری اسلامی ایران</p>
</div>

## ✨ ویژگی‌ها

### 🤖 مدل‌های پیشرفته هوش مصنوعی
- **DoRA (Weight-Decomposed Low-Rank Adaptation)**: تکنیک پیشرفته تطبیق مدل
- **QR-Adaptor**: بهینه‌سازی مشترک کوانتیزاسیون و رتبه
- **Persian BERT**: پردازش متون حقوقی فارسی

### 📊 دیتاست‌های واقعی
- **پرسش و پاسخ حقوقی ایران**: ۱۰,۲۴۷ نمونه از [PerSets/iran-legal-persian-qa](https://huggingface.co/datasets/PerSets/iran-legal-persian-qa)
- **متون قوانین ایران**: ۵۰,۰۰۰+ نمونه از [QomSSLab/legal_laws_lite_chunk_v1](https://huggingface.co/datasets/QomSSLab/legal_laws_lite_chunk_v1)
- **تشخیص موجودیت فارسی**: ۵۰۰,۰۰۰+ نمونه از [mansoorhamidzadeh/Persian-NER-Dataset-500k](https://huggingface.co/datasets/mansoorhamidzadeh/Persian-NER-Dataset-500k)

### 🎯 قابلیت‌های کلیدی
- ✅ آموزش واقعی مدل با TensorFlow.js
- ✅ نظارت بلادرنگ بر فرآیند آموزش
- ✅ پایگاه داده SQLite برای Windows VPS
- ✅ رابط کاربری فارسی کامل با RTL
- ✅ تجزیه و تحلیل اسناد حقوقی
- ✅ سیستم مدیریت کاربران
- ✅ گزارش‌گیری و صادرات داده

## 🚀 راه‌اندازی سریع

### پیش‌نیازها
- Node.js 18+
- npm یا yarn

### نصب و راه‌اندازی

```bash
# نصب dependencies
npm install

# اجرای سرور backend
npm run server

# اجرای frontend (در ترمینال جدید)
npm run dev

# یا اجرای همزمان هر دو
npm run dev:full
```

سیستم در آدرس‌های زیر در دسترس خواهد بود:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Database**: SQLite فایل `persian_legal_ai.db`

## 📖 راهنمای API

### Models API
```bash
# دریافت لیست مدل‌ها
GET /api/models

# ایجاد مدل جدید
POST /api/models
{
  "name": "مدل حقوقی من",
  "type": "persian-bert",
  "dataset_id": "iran-legal-qa",
  "config": {
    "epochs": 10,
    "batch_size": 32,
    "learning_rate": 0.001
  }
}

# شروع آموزش
POST /api/models/:id/train
{
  "epochs": 10,
  "batch_size": 32,
  "learning_rate": 0.001
}

# توقف آموزش
POST /api/models/:id/pause

# ادامه آموزش
POST /api/models/:id/resume

# حذف مدل
DELETE /api/models/:id
```

### Datasets API
```bash
# دریافت لیست دیتاست‌ها
GET /api/datasets

# دانلود دیتاست از HuggingFace
POST /api/datasets/:id/download
```

### Monitoring API
```bash
# دریافت متریک‌های سیستم
GET /api/monitoring

# دریافت لاگ‌ها
GET /api/logs?type=system&level=info&limit=100
GET /api/logs?type=training&limit=50
```

### Settings API
```bash
# دریافت تنظیمات
GET /api/settings

# بروزرسانی تنظیمات
PUT /api/settings
{
  "dataset_directory": "./datasets",
  "model_directory": "./models",
  "huggingface_token": "hf_xxx",
  "max_concurrent_training": "2",
  "default_batch_size": "32",
  "default_learning_rate": "0.001"
}
```

### Analytics API
```bash
# دریافت آمار و تحلیل‌ها
GET /api/analytics
```

## 🔧 تنظیمات دیتاست

### دانلود خودکار از HuggingFace
سیستم به طور خودکار دیتاست‌های زیر را از HuggingFace دانلود می‌کند:

1. **پرسش و پاسخ حقوقی ایران**
   - ID: `iran-legal-qa`
   - HuggingFace: `PerSets/iran-legal-persian-qa`
   - نمونه‌ها: ۱۰,۲۴۷

2. **متون قوانین ایران**
   - ID: `legal-laws`
   - HuggingFace: `QomSSLab/legal_laws_lite_chunk_v1`
   - نمونه‌ها: ۵۰,۰۰۰+

3. **تشخیص موجودیت فارسی**
   - ID: `persian-ner`
   - HuggingFace: `mansoorhamidzadeh/Persian-NER-Dataset-500k`
   - نمونه‌ها: ۵۰۰,۰۰۰+

### تنظیم مسیرها
در صفحه تنظیمات می‌توانید مسیرهای زیر را تنظیم کنید:
- **مسیر دیتاست‌ها**: `./datasets` (پیش‌فرض)
- **مسیر مدل‌ها**: `./models` (پیش‌فرض)
- **HuggingFace Token**: برای دسترسی به دیتاست‌های خصوصی

## 🏋️ فرآیند آموزش

### 1. ایجاد مدل جدید
- انتخاب نوع مدل (DoRA, QR-Adaptor, Persian BERT)
- انتخاب دیتاست
- تنظیم پارامترهای آموزش

### 2. شروع آموزش
- آموزش بلادرنگ با TensorFlow.js
- نظارت زنده بر پیشرفت
- نمایش متریک‌های عملکرد

### 3. مدیریت آموزش
- توقف و ادامه آموزش
- ذخیره checkpoint ها
- مشاهده لاگ‌های آموزش

### 4. ارزیابی نتایج
- نمودارهای دقت و loss
- مقایسه عملکرد مدل‌ها
- صادرات گزارش‌ها

## 📊 نظارت بر سیستم

### متریک‌های بلادرنگ
- استفاده از CPU و حافظه
- وضعیت آموزش مدل‌ها
- آمار دیتاست‌ها
- لاگ‌های سیستم

### WebSocket اتصالات
سیستم از WebSocket برای بروزرسانی بلادرنگ استفاده می‌کند:
- پیشرفت آموزش
- متریک‌های سیستم
- وضعیت دانلود دیتاست

## 🗄️ پایگاه داده

### SQLite Schema
```sql
-- مدل‌ها
CREATE TABLE models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('dora', 'qr-adaptor', 'persian-bert')),
  status TEXT CHECK(status IN ('idle', 'training', 'completed', 'failed', 'paused')),
  accuracy REAL DEFAULT 0,
  loss REAL DEFAULT 0,
  epochs INTEGER DEFAULT 0,
  current_epoch INTEGER DEFAULT 0,
  dataset_id TEXT,
  config TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- دیتاست‌ها
CREATE TABLE datasets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  huggingface_id TEXT,
  samples INTEGER DEFAULT 0,
  size_mb REAL DEFAULT 0,
  status TEXT CHECK(status IN ('available', 'downloading', 'processing', 'error'))
);

-- لاگ‌های آموزش
CREATE TABLE training_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id INTEGER,
  level TEXT CHECK(level IN ('info', 'warning', 'error', 'debug')),
  message TEXT NOT NULL,
  epoch INTEGER,
  loss REAL,
  accuracy REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 عیب‌یابی

### مشکلات رایج

#### خطای "Module not found"
```bash
# حذف node_modules و نصب مجدد
rm -rf node_modules package-lock.json
npm install
```

#### مشکل اتصال به پایگاه داده
```bash
# بررسی وجود فایل پایگاه داده
ls -la persian_legal_ai.db

# اجرای مجدد سرور
npm run server
```

#### خطای CORS
- اطمینان حاصل کنید که سرور روی پورت 3001 اجرا می‌شود
- بررسی تنظیمات proxy در `vite.config.ts`

#### مشکل دانلود دیتاست
- بررسی اتصال اینترنت
- تنظیم HuggingFace token در صفحه تنظیمات
- بررسی لاگ‌های سیستم برای جزئیات خطا

### لاگ‌ها و دیباگ
```bash
# مشاهده لاگ‌های سرور
npm run server

# مشاهده لاگ‌های frontend
npm run dev

# بررسی پایگاه داده
sqlite3 persian_legal_ai.db ".tables"
sqlite3 persian_legal_ai.db "SELECT * FROM models LIMIT 5;"
```

## 🤝 مشارکت

1. Fork کردن پروژه
2. ایجاد branch جدید (`git checkout -b feature/amazing-feature`)
3. Commit کردن تغییرات (`git commit -m 'Add amazing feature'`)
4. Push کردن به branch (`git push origin feature/amazing-feature`)
5. ایجاد Pull Request

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

## 📞 پشتیبانی

- 📧 ایمیل: support@persian-legal-ai.ir
- 💬 GitHub Issues: [ایجاد Issue جدید](https://github.com/your-repo/issues)

---

<div align="center">
  <p>ساخته شده با ❤️ برای جامعه حقوقی ایران</p>
</div>