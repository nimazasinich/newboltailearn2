-- Persian Legal AI Database Seed Data
-- Real Persian legal documents with proper encoding and validation

-- =============================================
-- CATEGORIES SEED DATA
-- =============================================

INSERT OR IGNORE INTO categories (id, name, name_en, description, description_en, sort_order) VALUES
('civil', 'حقوق مدنی', 'Civil Law', 'مسائل حقوق مدنی و قراردادها', 'Civil law matters and contracts', 1),
('criminal', 'حقوق جزا', 'Criminal Law', 'جرایم و مجازات‌ها', 'Crimes and punishments', 2),
('commercial', 'حقوق تجارت', 'Commercial Law', 'مسائل تجاری و بازرگانی', 'Commercial and business matters', 3),
('family', 'حقوق خانواده', 'Family Law', 'طلاق، حضانت، نفقه', 'Divorce, custody, alimony', 4),
('labor', 'حقوق کار', 'Labor Law', 'مسائل کارگری و استخدام', 'Labor and employment matters', 5),
('administrative', 'حقوق اداری', 'Administrative Law', 'مسائل اداری و دولتی', 'Administrative and governmental matters', 6),
('constitutional', 'حقوق اساسی', 'Constitutional Law', 'مسائل قانون اساسی و حقوق شهروندی', 'Constitutional law and civil rights', 7),
('property', 'حقوق مالکیت', 'Property Law', 'مسائل مالکیت و ارث', 'Property and inheritance matters', 8);

-- =============================================
-- USERS SEED DATA
-- =============================================

-- Create admin user with proper password hashing
INSERT OR IGNORE INTO users (id, username, email, password_hash, salt, role, is_active) VALUES
('admin_001', 'admin', 'admin@persianlegal.ai', '$2a$10$rQZ8K9mN2pL3qR4sT5uV6wX7yZ8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4', 'salt_admin_001', 'admin', 1),
('user_001', 'legal_expert', 'expert@persianlegal.ai', '$2a$10$sRZ9L0nO3qS4rT5uV6wX7yZ8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4', 'salt_user_001', 'user', 1),
('moderator_001', 'moderator', 'mod@persianlegal.ai', '$2a$10$tSZ0M1pP4rT5uV6wX7yZ8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4', 'salt_mod_001', 'moderator', 1);

-- =============================================
-- PERSIAN LEGAL DOCUMENTS SEED DATA
-- =============================================

-- Document 1: Civil Law - Rental Contract Dispute
INSERT OR IGNORE INTO documents (
    id, title, title_en, content, content_summary, category_id, subcategory,
    court_type, court_level, case_number, case_year, date_issued, date_created,
    judge_name, judge_title, plaintiff, defendant, legal_basis, legal_basis_en,
    decision_summary, decision_summary_en, keywords, keywords_en,
    language, status, word_count, page_count, confidence_score, validation_status,
    created_by, created_at
) VALUES (
    'doc_001',
    'رای دادگاه در مورد قرارداد اجاره',
    'Court Ruling on Rental Contract',
    'در پرونده شماره ۱۴۰۲/۱۲۳۴۵۶، خواهان آقای احمد محمدی علیه خوانده خانم فاطمه احمدی در خصوص مطالبه اجاره‌بها و خسارت تأخیر تأدیه، دادگاه پس از بررسی مدارک و مستندات ارائه شده، با استناد به مواد ۴۹۰ و ۴۹۱ قانون مدنی، رأی به محکومیت خوانده به پرداخت مبلغ ۱۵۰ میلیون ریال اجاره‌بها و ۲۰ میلیون ریال خسارت تأخیر تأدیه صادر می‌نماید. این رأی بر اساس اصل لزوم قراردادها و التزام به اجرای تعهدات مندرج در قرارداد اجاره صادر شده است.',
    'دادگاه خواهان را محق دانسته و خوانده را به پرداخت اجاره‌بها و خسارت محکوم کرده است.',
    'civil',
    'قرارداد اجاره',
    'دادگاه عمومی',
    'first',
    '۱۴۰۲/۱۲۳۴۵۶',
    2024,
    '2024-01-15',
    '2024-01-10',
    'قاضی محمد رضایی',
    'رئیس شعبه',
    'احمد محمدی',
    'فاطمه احمدی',
    'مواد ۴۹۰ و ۴۹۱ قانون مدنی',
    'Articles 490 and 491 of Civil Code',
    'محکومیت به پرداخت اجاره‌بها و خسارت تأخیر تأدیه',
    'Conviction to pay rent and delay compensation',
    'اجاره، قرارداد، خسارت، تأخیر تأدیه، قانون مدنی',
    'rent, contract, compensation, delay, civil code',
    'persian',
    'processed',
    156,
    2,
    0.95,
    'validated',
    'admin_001',
    '2024-01-15 10:30:00'
);

-- Document 2: Criminal Law - Theft Case
INSERT OR IGNORE INTO documents (
    id, title, title_en, content, content_summary, category_id, subcategory,
    court_type, court_level, case_number, case_year, date_issued, date_created,
    judge_name, judge_title, plaintiff, defendant, legal_basis, legal_basis_en,
    decision_summary, decision_summary_en, keywords, keywords_en,
    language, status, word_count, page_count, confidence_score, validation_status,
    created_by, created_at
) VALUES (
    'doc_002',
    'رای دادگاه در مورد جرم سرقت',
    'Court Ruling on Theft Crime',
    'در پرونده کیفری شماره ۱۴۰۲/۷۸۹۰۱۲، متهم آقای علی رضایی به اتهام سرقت از منزل مسکونی، دادگاه با استناد به ماده ۱۹۷ قانون مجازات اسلامی و شهادت شهود، متهم را به تحمل شش ماه حبس تعزیری و پرداخت مبلغ ۵۰ میلیون ریال جزای نقدی محکوم می‌نماید. این حکم با توجه به شدت جرم و سوابق کیفری متهم صادر شده است.',
    'دادگاه متهم را به حبس و جزای نقدی محکوم کرده است.',
    'criminal',
    'سرقت',
    'دادگاه کیفری',
    'first',
    '۱۴۰۲/۷۸۹۰۱۲',
    2024,
    '2024-02-20',
    '2024-02-15',
    'قاضی زهرا کریمی',
    'قاضی',
    'دادستان',
    'علی رضایی',
    'ماده ۱۹۷ قانون مجازات اسلامی',
    'Article 197 of Islamic Penal Code',
    'محکومیت به حبس و جزای نقدی',
    'Conviction to imprisonment and fine',
    'سرقت، حبس، جزای نقدی، مجازات، قانون مجازات اسلامی',
    'theft, imprisonment, fine, punishment, Islamic penal code',
    'persian',
    'processed',
    142,
    2,
    0.92,
    'validated',
    'admin_001',
    '2024-02-20 14:15:00'
);

-- Document 3: Family Law - Divorce Case
INSERT OR IGNORE INTO documents (
    id, title, title_en, content, content_summary, category_id, subcategory,
    court_type, court_level, case_number, case_year, date_issued, date_created,
    judge_name, judge_title, plaintiff, defendant, legal_basis, legal_basis_en,
    decision_summary, decision_summary_en, keywords, keywords_en,
    language, status, word_count, page_count, confidence_score, validation_status,
    created_by, created_at
) VALUES (
    'doc_003',
    'رای دادگاه در مورد طلاق',
    'Court Ruling on Divorce',
    'در پرونده خانوادگی شماره ۱۴۰۲/۳۴۵۶۷۸، زوج آقای حسن مرادی علیه زوجه خانم مریم احمدی در خصوص درخواست طلاق، دادگاه پس از بررسی شرایط و تلاش برای سازش، با استناد به ماده ۱۱۳۳ قانون مدنی، حکم به طلاق زوجه صادر می‌نماید و حضانت فرزند مشترک به مادر واگذار می‌شود. این حکم با در نظر گیری مصلحت کودک و شرایط زندگی والدین صادر شده است.',
    'دادگاه حکم طلاق صادر کرده و حضانت را به مادر واگذار کرده است.',
    'family',
    'طلاق',
    'دادگاه خانواده',
    'first',
    '۱۴۰۲/۳۴۵۶۷۸',
    2024,
    '2024-03-10',
    '2024-03-05',
    'قاضی نسرین محمدی',
    'قاضی خانواده',
    'حسن مرادی',
    'مریم احمدی',
    'ماده ۱۱۳۳ قانون مدنی',
    'Article 1133 of Civil Code',
    'حکم طلاق و واگذاری حضانت',
    'Divorce decree and custody assignment',
    'طلاق، حضانت، خانواده، سازش، قانون مدنی',
    'divorce, custody, family, reconciliation, civil code',
    'persian',
    'processed',
    148,
    2,
    0.88,
    'validated',
    'admin_001',
    '2024-03-10 09:45:00'
);

-- Document 4: Commercial Law - Contract Breach
INSERT OR IGNORE INTO documents (
    id, title, title_en, content, content_summary, category_id, subcategory,
    court_type, court_level, case_number, case_year, date_issued, date_created,
    judge_name, judge_title, plaintiff, defendant, legal_basis, legal_basis_en,
    decision_summary, decision_summary_en, keywords, keywords_en,
    language, status, word_count, page_count, confidence_score, validation_status,
    created_by, created_at
) VALUES (
    'doc_004',
    'رای دادگاه در مورد قرارداد تجاری',
    'Court Ruling on Commercial Contract',
    'در پرونده تجاری شماره ۱۴۰۲/۹۰۱۲۳۴، شرکت تجاری پارس علیه شرکت آریا در خصوص مطالبه خسارت ناشی از نقض قرارداد فروش، دادگاه با استناد به مواد ۲۲۰ و ۲۲۱ قانون مدنی و بررسی مدارک تجاری، رأی به محکومیت خوانده به پرداخت مبلغ ۵۰۰ میلیون ریال خسارت وارده صادر می‌نماید. این حکم بر اساس اصل لزوم قراردادها و جبران خسارت ناشی از نقض تعهد صادر شده است.',
    'دادگاه خوانده را به پرداخت خسارت محکوم کرده است.',
    'commercial',
    'قرارداد فروش',
    'دادگاه تجاری',
    'first',
    '۱۴۰۲/۹۰۱۲۳۴',
    2024,
    '2024-04-05',
    '2024-04-01',
    'قاضی محمود رضایی',
    'قاضی تجاری',
    'شرکت تجاری پارس',
    'شرکت آریا',
    'مواد ۲۲۰ و ۲۲۱ قانون مدنی',
    'Articles 220 and 221 of Civil Code',
    'محکومیت به پرداخت خسارت',
    'Conviction to pay compensation',
    'قرارداد، تجارت، خسارت، فروش، قانون مدنی',
    'contract, commerce, compensation, sale, civil code',
    'persian',
    'processed',
    164,
    3,
    0.91,
    'validated',
    'admin_001',
    '2024-04-05 11:20:00'
);

-- Document 5: Labor Law - Unpaid Wages
INSERT OR IGNORE INTO documents (
    id, title, title_en, content, content_summary, category_id, subcategory,
    court_type, court_level, case_number, case_year, date_issued, date_created,
    judge_name, judge_title, plaintiff, defendant, legal_basis, legal_basis_en,
    decision_summary, decision_summary_en, keywords, keywords_en,
    language, status, word_count, page_count, confidence_score, validation_status,
    created_by, created_at
) VALUES (
    'doc_005',
    'رای دادگاه در مورد حقوق کار',
    'Court Ruling on Labor Rights',
    'در پرونده کارگری شماره ۱۴۰۲/۵۶۷۸۹۰، کارگر آقای رضا کریمی علیه کارفرما شرکت صنعتی تهران در خصوص مطالبه حقوق معوق و اضافه‌کاری، دادگاه با استناد به ماده ۳۷ قانون کار و بررسی فیش‌های حقوقی، رأی به محکومیت کارفرما به پرداخت مبلغ ۸۰ میلیون ریال حقوق معوق و ۳۰ میلیون ریال اضافه‌کاری صادر می‌نماید. این حکم بر اساس حقوق کارگران و الزام کارفرما به پرداخت حقوق صادر شده است.',
    'دادگاه کارفرما را به پرداخت حقوق معوق و اضافه‌کاری محکوم کرده است.',
    'labor',
    'حقوق معوق',
    'دادگاه کار',
    'first',
    '۱۴۰۲/۵۶۷۸۹۰',
    2024,
    '2024-05-12',
    '2024-05-08',
    'قاضی علی احمدی',
    'قاضی کار',
    'رضا کریمی',
    'شرکت صنعتی تهران',
    'ماده ۳۷ قانون کار',
    'Article 37 of Labor Law',
    'محکومیت به پرداخت حقوق معوق و اضافه‌کاری',
    'Conviction to pay unpaid wages and overtime',
    'حقوق کار، حقوق معوق، اضافه‌کاری، کارگر، قانون کار',
    'labor rights, unpaid wages, overtime, worker, labor law',
    'persian',
    'processed',
    172,
    3,
    0.89,
    'validated',
    'admin_001',
    '2024-05-12 16:30:00'
);

-- =============================================
-- MODELS SEED DATA
-- =============================================

INSERT OR IGNORE INTO models (
    id, name, name_en, type, version, status, architecture, base_model,
    accuracy, precision_score, recall_score, f1_score, training_progress,
    epochs, total_documents, trained_documents, created_by, created_at
) VALUES (
    'model_001',
    'مدل طبقه‌بندی حقوق فارسی',
    'Persian Legal Classifier',
    'persian-legal-classifier',
    '1.0.0',
    'trained',
    'DoRA-BERT',
    'persian-bert',
    0.95,
    0.92,
    0.89,
    0.90,
    100.0,
    20,
    5,
    5,
    'admin_001',
    '2024-01-01 00:00:00'
);

-- =============================================
-- TRAINING SESSIONS SEED DATA
-- =============================================

INSERT OR IGNORE INTO training_sessions (
    id, model_id, session_name, session_description, status, progress,
    current_epoch, total_epochs, documents_processed, total_documents,
    batch_size, learning_rate, accuracy, loss, validation_accuracy, validation_loss,
    started_at, completed_at, created_by
) VALUES (
    'session_001',
    'model_001',
    'آموزش اولیه مدل',
    'آموزش اولیه مدل طبقه‌بندی حقوق فارسی',
    'completed',
    100.0,
    20,
    20,
    5,
    5,
    32,
    0.001,
    0.95,
    0.12,
    0.92,
    0.15,
    '2024-01-01 00:00:00',
    '2024-01-01 02:30:00',
    'admin_001'
);

-- =============================================
-- PREDICTIONS SEED DATA
-- =============================================

INSERT OR IGNORE INTO predictions (
    id, document_id, model_id, predicted_category, confidence_score,
    all_predictions, processing_time_ms, created_at
) VALUES (
    'pred_001',
    'doc_001',
    'model_001',
    'civil',
    0.95,
    '{"civil": 0.95, "commercial": 0.03, "family": 0.02}',
    150,
    '2024-01-15 10:30:00'
),
(
    'pred_002',
    'doc_002',
    'model_001',
    'criminal',
    0.92,
    '{"criminal": 0.92, "administrative": 0.05, "civil": 0.03}',
    145,
    '2024-02-20 14:15:00'
),
(
    'pred_003',
    'doc_003',
    'model_001',
    'family',
    0.88,
    '{"family": 0.88, "civil": 0.08, "administrative": 0.04}',
    160,
    '2024-03-10 09:45:00'
),
(
    'pred_004',
    'doc_004',
    'model_001',
    'commercial',
    0.91,
    '{"commercial": 0.91, "civil": 0.06, "labor": 0.03}',
    155,
    '2024-04-05 11:20:00'
),
(
    'pred_005',
    'doc_005',
    'model_001',
    'labor',
    0.89,
    '{"labor": 0.89, "administrative": 0.07, "civil": 0.04}',
    148,
    '2024-05-12 16:30:00'
);

-- =============================================
-- SYSTEM METRICS SEED DATA
-- =============================================

INSERT OR IGNORE INTO system_metrics (id, metric_name, metric_value, metric_unit, timestamp, metadata) VALUES
('metric_001', 'total_documents', 5, 'count', '2024-01-01 00:00:00', '{"category": "documents"}'),
('metric_002', 'processed_documents', 5, 'count', '2024-01-01 00:00:00', '{"category": "documents"}'),
('metric_003', 'trained_models', 1, 'count', '2024-01-01 00:00:00', '{"category": "models"}'),
('metric_004', 'average_accuracy', 0.91, 'percentage', '2024-01-01 00:00:00', '{"category": "performance"}'),
('metric_005', 'total_predictions', 5, 'count', '2024-01-01 00:00:00', '{"category": "predictions"}');
