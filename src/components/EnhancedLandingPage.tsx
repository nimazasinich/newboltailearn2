import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Brain, ArrowLeft, Sparkles, Zap, Target, BookOpen, Shield, 
  Database, Users, TrendingUp, Award, CheckCircle, Play,
  BarChart3, FileText, Globe, Cpu, Monitor, Heart
} from "lucide-react";

interface SystemStats {
  models: number;
  datasets: number;
  accuracy: number;
  documents: number;
}

export function EnhancedLandingPage(): React.ReactElement {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats>({ models: 0, datasets: 0, accuracy: 0, documents: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Animate numbers counting up
  useEffect(() => {
    const finalStats = { models: 12, datasets: 47, accuracy: 94.5, documents: 127000 };
    
    setTimeout(() => {
      setStats(finalStats);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleStart = () => {
    navigate("/overview");
  };

  const features = [
    {
      icon: Brain,
      title: "هوش مصنوعی پیشرفته",
      description: "آموزش مدل‌های عمیق با معماری ترنسفورمر برای پردازش متون حقوقی فارسی",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "قوانین جمهوری اسلامی",
      description: "پایگاه داده جامع قوانین ایران با دسته‌بندی هوشمند و جستجوی پیشرفته",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: BarChart3,
      title: "آنالیتیکس پیشرفته",
      description: "داشبورد تحلیلی با نمودارهای تعاملی برای نظارت بر عملکرد مدل‌ها",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Database,
      title: "مدیریت داده‌های حقوقی",
      description: "سیستم مدیریت داده با امتیازدهی کیفیت و ارزیابی منابع قانونی",
      color: "from-orange-500 to-red-500"
    }
  ];

  const achievements = [
    { label: "مدل‌های آموزش دیده", value: stats.models, suffix: "+" },
    { label: "مجموعه داده", value: stats.datasets, suffix: "+" },
    { label: "دقت میانگین", value: stats.accuracy, suffix: "%" },
    { label: "سند حقوقی", value: stats.documents, suffix: "+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden" dir="rtl">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-pink-600/10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-2xl animate-bounce delay-500" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "40px 40px"
            }}
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-6 flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">هوش مصنوعی حقوقی ایران</h2>
              <p className="text-blue-200 text-sm">سیستم یادگیری عمیق قوانین</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-200">سیستم آماده</span>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-500">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-60 animate-pulse" />
                  
                  {/* Floating particles */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
                    animate={{ y: [-10, 10], rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <motion.div
                    className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full"
                    animate={{ y: [10, -10], x: [-5, 5] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    هوش مصنوعی حقوقی
                  </span>
                </h1>
                
                <div className="flex items-center justify-center gap-6 text-2xl md:text-4xl font-bold text-slate-300 mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-10 h-10 text-yellow-400" />
                  </motion.div>
                  <span>نسل جدید قضاوت هوشمند</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-10 h-10 text-cyan-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-12"
              >
                <p className="text-xl md:text-3xl text-slate-200 mb-8 max-w-5xl mx-auto leading-relaxed">
                  آموزش و ارزیابی مدل‌های یادگیری عمیق با قوانین جمهوری اسلامی ایران
                  <br />
                  <span className="text-cyan-300 font-semibold text-lg md:text-2xl">
                    دقت بالا • سرعت فوق‌العاده • قابلیت اعتماد کامل • هوش مصنوعی اخلاقی
                  </span>
                </p>

                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Play className="w-6 h-6" />
                  شروع کار با سیستم
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.div>
                </motion.button>
              </motion.div>
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text mb-2"
                      animate={isLoading ? {} : { scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.6, delay: 1.5 + index * 0.1 }}
                    >
                      {isLoading ? "..." : achievement.value.toLocaleString('fa-IR')}{achievement.suffix}
                    </motion.div>
                    <div className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                      {achievement.label}
                    </div>
                    <div className="w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mt-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.6 + index * 0.2 }}
                  className="group"
                >
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105">
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Technical Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30 mb-12"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text mb-4">
                  ویژگی‌های فنی پیشرفته
                </h3>
                <p className="text-slate-300">
                  بر پایه جدیدترین تکنولوژی‌های هوش مصنوعی و پردازش زبان طبیعی
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[
                  { icon: Cpu, name: "پردازش موازی", desc: "GPU Acceleration" },
                  { icon: Database, name: "پایگاه داده", desc: "SQLite + Vector DB" },
                  { icon: Globe, name: "WebSocket", desc: "Real-time Updates" },
                  { icon: Shield, name: "امنیت", desc: "Enterprise Security" },
                  { icon: Monitor, name: "مانیتورینگ", desc: "Live Monitoring" },
                  { icon: Heart, name: "عملکرد", desc: "High Performance" }
                ].map((tech, index) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 2.2 + index * 0.1 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center group-hover:from-cyan-500 group-hover:to-blue-500 transition-all duration-300">
                      <tech.icon className="h-8 w-8 text-slate-300 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {tech.name}
                    </div>
                    <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                      {tech.desc}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.5 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/30">
                <h3 className="text-3xl font-bold text-white mb-4">
                  آماده شروع هستید؟
                </h3>
                <p className="text-xl text-slate-300 mb-8">
                  به سیستم هوش مصنوعی حقوقی ایران بپیوندید و تجربه آینده قضاوت را داشته باشید
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    onClick={handleStart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300"
                  >
                    <Play className="w-6 h-6" />
                    ورود به داشبورد
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <FileText className="w-6 h-6" />
                    مطالعه مستندات
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 3.0 }}
          className="p-6 text-center"
        >
          <div className="text-slate-400 text-sm">
            © 2024 سیستم هوش مصنوعی حقوقی ایران - تمامی حقوق محفوظ است
          </div>
        </motion.footer>
      </div>
    </div>
  );
}