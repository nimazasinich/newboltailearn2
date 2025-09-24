import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrganicCard } from './ui/OrganicCard';
import { ZenProgress } from './ui/ZenProgress';
import { SlimBadge } from './ui/SlimBadge';
import { Button } from './ui/Button';
import { getDatasetCatalog, headDataset, downloadDatasetById, saveBlob } from '../services/datasets';
import { 
  Search, 
  Download, 
  Eye, 
  Filter,
  Database,
  Star,
  Users,
  Calendar,
  X,
  CheckCircle,
  Globe,
  Heart,
  Bookmark
} from 'lucide-react';

// Mock enhanced data for better display
const ENHANCED_DATASETS = [
  {
    id: 'persian-legal-qa-v2',
    title: 'Persian Legal QA Dataset v2.0',
    description: 'مجموعه جامع پرسش و پاسخ حقوقی فارسی با پوشش کامل حوزه‌های مختلف حقوقی',
    samples: 25000,
    size_mb: 125.5,
    tags: ['legal', 'qa', 'persian', 'premium'],
    rating: 4.9,
    downloads: 1250,
    author: 'Legal AI Team',
    license: 'Academic Use',
    created_at: '2024-01-15',
    updated_at: '2024-03-10',
    featured: true,
    categories: ['Civil Law', 'Criminal Law', 'Commercial Law']
  },
  {
    id: 'court-decisions-extended',
    title: 'Extended Court Decisions Dataset',
    description: 'مجموعه گسترده رای‌های دادگاه با طبقه‌بندی دقیق و برچسب‌گذاری حرفه‌ای',
    samples: 18500,
    size_mb: 89.2,
    tags: ['legal', 'classification', 'court', 'decisions'],
    rating: 4.7,
    downloads: 890,
    author: 'Judiciary Data Team',
    license: 'Open Source',
    created_at: '2024-02-01',
    updated_at: '2024-03-05',
    featured: false,
    categories: ['Court Decisions', 'Legal Classification']
  },
  {
    id: 'contract-analysis-pro',
    title: 'Professional Contract Analysis Dataset',
    description: 'دیتاست تخصصی تحلیل قراردادها شامل انواع قراردادهای تجاری و حقوقی',
    samples: 12000,
    size_mb: 67.8,
    tags: ['contracts', 'analysis', 'commercial', 'legal'],
    rating: 4.8,
    downloads: 650,
    author: 'Commercial Law Institute',
    license: 'Commercial',
    created_at: '2024-01-20',
    updated_at: '2024-02-28',
    featured: true,
    categories: ['Contract Analysis', 'Commercial Law']
  },
  {
    id: 'legal-document-classifier',
    title: 'Legal Document Classifier Dataset',
    description: 'مجموعه داده دسته‌بندی اسناد حقوقی با دقت بالا و پوشش جامع',
    samples: 15800,
    size_mb: 94.3,
    tags: ['classification', 'documents', 'legal', 'nlp'],
    rating: 4.6,
    downloads: 720,
    author: 'NLP Research Group',
    license: 'Research Only',
    created_at: '2024-02-10',
    updated_at: '2024-03-01',
    featured: false,
    categories: ['Document Classification', 'NLP']
  },
  {
    id: 'persian-legal-ner',
    title: 'Persian Legal Named Entity Recognition',
    description: 'دیتاست شناسایی موجودیت‌های نام‌دار در متون حقوقی فارسی',
    samples: 8500,
    size_mb: 34.2,
    tags: ['ner', 'legal', 'persian', 'entities'],
    rating: 4.5,
    downloads: 420,
    author: 'Persian NLP Lab',
    license: 'Academic Use',
    created_at: '2024-02-25',
    updated_at: '2024-03-08',
    featured: false,
    categories: ['Named Entity Recognition', 'Persian NLP']
  },
  {
    id: 'legal-summarization',
    title: 'Legal Text Summarization Dataset',
    description: 'مجموعه داده خلاصه‌سازی متون حقوقی با خلاصه‌های دست‌نویس',
    samples: 6200,
    size_mb: 45.7,
    tags: ['summarization', 'legal', 'text', 'generation'],
    rating: 4.4,
    downloads: 310,
    author: 'Text Generation Lab',
    license: 'Open Source',
    created_at: '2024-03-01',
    updated_at: '2024-03-12',
    featured: false,
    categories: ['Text Summarization', 'Generation']
  }
];

export default function DatasetGallery() {
  const [items, setItems] = React.useState(ENHANCED_DATASETS);
  const [filter, setFilter] = React.useState<string>('all');
  const [q, setQ] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [preview, setPreview] = React.useState<any | null>(null);
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => item.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [items]);

  const filtered = React.useMemo(() => {
    let list = items;
    if (filter !== 'all') {
      list = list.filter(item => item.tags.includes(filter));
    }
    if (q.trim()) {
      const searchTerm = q.trim().toLowerCase();
      list = list.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [items, filter, q]);

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  async function onPreview(item: any) {
    setErr(null);
    setPreview({ 
      ...item, 
      content: `
### ${item.title}

**نویسنده:** ${item.author}
**تاریخ ایجاد:** ${new Date(item.created_at).toLocaleDateString('fa-IR')}
**آخرین به‌روزرسانی:** ${new Date(item.updated_at).toLocaleDateString('fa-IR')}

**دسته‌بندی‌ها:**
${item.categories.map((cat: string) => `- ${cat}`).join('\n')}

**توضیحات:**
${item.description}

**مجوز استفاده:** ${item.license}
**تعداد نمونه‌ها:** ${item.samples.toLocaleString()} 
**حجم فایل:** ${item.size_mb} مگابایت

**برچسب‌ها:** ${item.tags.join(', ')}
      `
    });
  }

  async function onDownload(item: any) {
    setErr(null);
    setBusyId(item.id);
    setProgress(0);
    
    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // In real implementation, use the actual download function
      // const blob = await downloadDatasetById(item.id, setProgress);
      // saveBlob(blob, `${item.title.replace(/\s+/g,'_')}.zip`);
      
      alert(`دانلود ${item.title} با موفقیت آغاز شد!`);
    } catch (e: any) {
      setErr(e?.message || 'خطا در دانلود');
    } finally {
      setBusyId(null);
      setProgress(0);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-light text-slate-900 dark:text-slate-100"
          >
            گالری دیتاست‌ها
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            مجموعه کامل دیتاست‌های آماده برای پروژه‌های هوش مصنوعی حقوقی
          </motion.p>
        </div>

        {/* Search and Filters */}
        <OrganicCard variant="wave" className="!p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو در دیتاست‌ها..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-white/80 dark:bg-slate-800/80 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                <option value="all">همه دسته‌ها</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </OrganicCard>

        {/* Error Display */}
        {err && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-300"
          >
            خطا: {err}
          </motion.div>
        )}

        {/* Featured Datasets */}
        {filtered.some(item => item.featured) && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              دیتاست‌های ویژه
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.filter(item => item.featured).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OrganicCard variant="blob" gradient="from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="w-6 h-6 text-yellow-600" />
                          <SlimBadge variant="warning" size="xs">ویژه</SlimBadge>
                        </div>
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="p-2 rounded-full hover:bg-white/50 transition-colors"
                        >
                          <Heart className={`w-5 h-5 ${favorites.has(item.id) ? 'text-red-500 fill-current' : 'text-slate-400'}`} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                          {item.description}
                        </p>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span>{item.samples.toLocaleString()} نمونه</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4 text-slate-500" />
                            <span>{item.downloads} دانلود</span>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map(tag => (
                            <SlimBadge key={tag} variant="neutral" size="xs">
                              {tag}
                            </SlimBadge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onPreview(item)}
                          className="flex-1 rounded-xl"
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          پیش‌نمایش
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => onDownload(item)}
                          disabled={busyId === item.id}
                          className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          {busyId === item.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              {progress}%
                            </div>
                          ) : (
                            <>
                              <Download className="w-4 h-4 ml-1" />
                              دانلود
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Download Progress */}
                      {busyId === item.id && progress > 0 && (
                        <ZenProgress 
                          value={progress} 
                          variant="success"
                          organic={true}
                          animated={true}
                        />
                      )}
                    </div>
                  </OrganicCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Datasets */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-500" />
            همه دیتاست‌ها
            <SlimBadge variant="neutral">{filtered.length} مورد</SlimBadge>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.filter(item => !item.featured).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OrganicCard variant={index % 4 === 0 ? 'wave' : index % 4 === 1 ? 'bubble' : index % 4 === 2 ? 'leaf' : 'blob'}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <Database className="w-6 h-6 text-blue-500" />
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-2 rounded-full hover:bg-white/50 transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${favorites.has(item.id) ? 'text-red-500 fill-current' : 'text-slate-400'}`} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {item.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">نمونه‌ها:</span>
                          <span className="font-medium mr-1">{item.samples.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">حجم:</span>
                          <span className="font-medium mr-1">{item.size_mb} MB</span>
                        </div>
                        <div>
                          <span className="text-slate-500">نویسنده:</span>
                          <span className="font-medium mr-1 text-xs">{item.author}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">مجوز:</span>
                          <span className="font-medium mr-1 text-xs">{item.license}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Download className="w-3 h-3" />
                          {item.downloads}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map(tag => (
                          <SlimBadge key={tag} variant="neutral" size="xs">
                            {tag}
                          </SlimBadge>
                        ))}
                        {item.tags.length > 3 && (
                          <SlimBadge variant="neutral" size="xs">
                            +{item.tags.length - 3}
                          </SlimBadge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onPreview(item)}
                        className="flex-1 rounded-xl"
                      >
                        <Eye className="w-4 h-4 ml-1" />
                        پیش‌نمایش
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => onDownload(item)}
                        disabled={busyId === item.id}
                        className="flex-1 rounded-xl"
                      >
                        {busyId === item.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {progress}%
                          </div>
                        ) : (
                          <>
                            <Download className="w-4 h-4 ml-1" />
                            دانلود
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Download Progress */}
                    {busyId === item.id && progress > 0 && (
                      <ZenProgress 
                        value={progress} 
                        variant="info"
                        organic={true}
                        animated={true}
                      />
                    )}
                  </div>
                </OrganicCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setPreview(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{preview.title}</h3>
                  <button 
                    onClick={() => setPreview(null)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{preview.content}</pre>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}