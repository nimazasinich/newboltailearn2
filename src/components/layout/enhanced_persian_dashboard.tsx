          {/* Enhanced Models Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group"
          >
            {/* Section glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl shadow-purple-500/30">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                    مدل‌های یادگیری عمیق
                  </span>
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl text-white font-semibold flex items-center gap-3 shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  مدل جدید
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence>
                  {models.map((model, index) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      className="relative group/model cursor-pointer"
                      onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                    >
                      {/* Model card glow effects */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(model.status).replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')}/20 rounded-3xl blur-xl group-hover/model:blur-2xl transition-all duration-500`} />
                      <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(model.status).replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')}/10 rounded-3xl blur-lg transition-all duration-300`} />
                      
                      <div className={`relative rounded-3xl border-2 transition-all duration-300 backdrop-blur-sm p-8 ${
                        selectedModel === model.id 
                          ? 'bg-gradient-to-br from-blue-900/60 to-cyan-900/60 border-cyan-400/50 shadow-2xl shadow-cyan-500/20' 
                          : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/30 hover:border-slate-500/50 shadow-xl hover:shadow-2xl'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getStatusColor(model.status)} flex items-center justify-center shadow-xl`}>
                            {getStatusIcon(model.status)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg leading-tight mb-1">{model.name}</h3>
                            <p className="text-sm text-slate-300 flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                model.status === 'training' ? 'bg-emerald-400 animate-pulse' :
                                model.status === 'completed' ? 'bg-emerald-400' :
                                model.status === 'paused' ? 'bg-amber-400' :
                                model.status === 'error' ? 'bg-red-400' :
                                'bg-slate-400'
                              }`} />
                              {getStatusText(model.status)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{model.accuracy.toFixed(1)}%</div>
                          <div className="text-sm text-slate-400">دقت</div>
                        </div>
                      </div>

                      {/* Enhanced Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-slate-300 mb-3">
                          <span className="font-medium">پیشرفت آموزش</span>
                          <span className="font-bold text-emerald-400">{model.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-4 shadow-inner overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${model.progress}%` }}
                            transition={{ duration: 2, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                            className={`h-4 bg-gradient-to-r ${getStatusColor(model.status)} rounded-full shadow-lg relative overflow-hidden`}
                          >
                            {/* Animated effects */}
                            <motion.div
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            />
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-full"
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Model Details */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                          <div className="text-lg font-bold text-cyan-400">{model.epochs}</div>
                          <div className="text-xs text-slate-400">دوره</div>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                          <div className="text-lg font-bold text-emerald-400">
                            {Math.floor(Math.random() * 1000 + 5000).toLocaleString('fa-IR')}
                          </div>
                          <div className="text-xs text-slate-400">نمونه</div>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                          <div className="text-lg font-bold text-purple-400">
                            {Math.floor(Math.random() * 60 + 15)} دق
                          </div>
                          <div className="text-xs text-slate-400">باقیمانده</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-emerald-500/30"
                        >
                          <Play className="w-4 h-4" />
                          شروع
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-blue-500/30"
                        >
                          <Settings className="w-4 h-4" />
                          تنظیمات
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-purple-500/30"
                        >
                          <BarChart3 className="w-4 h-4" />
                          آمار
                        </motion.button>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {selectedModel === model.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-6 pt-6 border-t border-slate-600/50"
                          >
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                  <div className="text-sm text-blue-300 mb-1">نوع مدل</div>
                                  <div className="text-white font-medium">{model.type}</div>
                                </div>
                                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                  <div className="text-sm text-emerald-300 mb-1">تاریخ ایجاد</div>
                                  <div className="text-white font-medium">
                                    {new Date(model.created_at).toLocaleDateString('fa-IR')}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <div className="text-sm text-purple-300 mb-2">عملکرد جزئی</div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">دقت تدریجی:</span>
                                    <span className="text-emerald-300 font-medium">94.2%</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">نرخ یادگیری:</span>
                                    <span className="text-blue-300 font-medium">0.001</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">Loss فعلی:</span>
                                    <span className="text-purple-300 font-medium">0.42</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30">
                    <LineChart className="w-5 h-5 text-white" />
                  </div>
                  عملکرد آموزش
                </h3>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="epoch" 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '12px',
                          color: '#f9fafb',
                          backdropFilter: 'blur(16px)'
                        }}
                        labelStyle={{ color: '#d1d5db' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#accuracyGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Legal Categories */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 to-orange-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  دسته‌بندی قوانین
                </h3>
                
                <div className="space-y-4">
                  {legalCategories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 8 }}
                      className="relative group/category cursor-pointer"
                    >
                      {/* Individual category glow */}
                      <div 
                        className="absolute inset-0 rounded-2xl blur-lg group-hover/category:blur-xl transition-all duration-300 opacity-60"
                        style={{ backgroundColor: `${category.color}20` }}
                      />
                      
                      <div className="relative flex items-center justify-between p-4 bg-slate-800/60 rounded-2xl hover:bg-slate-700/60 transition-all border border-slate-700/30 hover:border-slate-600/50">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-4 h-4 rounded-full shadow-lg animate-pulse"
                            style={{ 
                              backgroundColor: category.color,
                              boxShadow: `0 0 20px ${category.color}50`
                            }}
                          />
                          <div>
                            <div className="text-base font-semibold text-white">{category.name}</div>
                            <div className="text-sm text-slate-400">
                              {category.models} مدل • {category.documents.toLocaleString('fa-IR')} سند
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-400">{category.accuracy}%</div>
                          <div className="text-xs text-slate-400">دقت</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Training Activity & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Training Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/15 to-rose-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-pink-500/30">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  فعالیت‌های اخیر
                </h3>
                
                <div className="space-y-4">
                  {[
                    { action: 'آموزش مدل قوانین مدنی آغاز شد', time: '2 دقیقه پیش', type: 'info' },
                    { action: 'مدل قوانین جزایی با موفقیت تکمیل شد', time: '15 دقیقه پیش', type: 'success' },
                    { action: 'بروزرسانی مجموعه داده تجاری', time: '30 دقیقه پیش', type: 'info' },
                    { action: 'خطا در مدل قوانین اداری رفع شد', time: '1 ساعت پیش', type: 'warning' },
                    { action: 'بکاپ اتوماتیک سیستم انجام شد', time: '2 ساعت پیش', type: 'success' }
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-2xl hover:bg-slate-700/50 transition-all group/activity"
                    >
                      <div className={`w-3 h-3 rounded-full mt-2 shadow-lg ${
                        activity.type === 'success' ? 'bg-emerald-400 shadow-emerald-400/50' :
                        activity.type === 'warning' ? 'bg-amber-400 shadow-amber-400/50' :
                        'bg-blue-400 shadow-blue-400/50'
                      } animate-pulse`} />
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium mb-1">{activity.action}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* System Analytics Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 to-violet-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/30">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  تحلیل عملکرد
                </h3>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBar data={legalCategories}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af"
                        style={{ fontSize: '10px' }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '12px',
                          color: '#f9fafb',
                          backdropFilter: 'blur(16px)'
                        }}
                        labelStyle={{ color: '#d1d5db' }}
                      />
                      <Bar 
                        dataKey="accuracy" 
                        fill="url(#barGradient)"
                        radius={[6, 6, 0, 0]}
                      />
                    </RechartsBar>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { title: 'کل اسناد پردازش شده', value: '54,782', icon: FileText, color: 'blue' },
                  { title: 'ساعات آموزش', value: '1,247', icon: Clock, color: 'emerald' },
                  { title: 'دقت کلی سیستم', value: '92.4%', icon: Target, color: 'purple' },
                  { title: 'کاربران فعال', value: '156', icon: Users, color: 'cyan' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                    className="text-center relative group/stat"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-${stat.color}-500/10 to-${stat.color}-600/10 rounded-2xl blur-lg group-hover/stat:blur-xl transition-all duration-300`} />
                    
                    <div className="relative p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all">
                      <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-xl flex items-center justify-center shadow-lg shadow-${stat.color}-500/30`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-slate-400">{stat.title}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Refresh Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 2.0 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={loadData}
          className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-cyan-500/30 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <RefreshCw className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      </motion.div>
    </div>
  );
}import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, Database, Users, Activity, Play, Pause, Square,
  BarChart3, PieChart, LineChart, Monitor, Cpu, HardDrive, Wifi,
  CheckCircle, AlertTriangle, Clock, Target, Award, Zap,
  FileText, BookOpen, Scale, Gavel, Briefcase, Shield,
  Heart, ArrowLeft, Settings, Home, ChevronRight, Bell,
  Search, Filter, Plus, Eye, Download, Share2, Star,
  Layers, Globe, Lock, Sparkles, Calendar, MessageSquare,
  ChevronDown, ChevronUp, Menu, X, Maximize2, Minimize2,
  RefreshCw, Power, WifiOff, AlertCircle
} from 'lucide-react';
import { 
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as RechartsLine, Line, PieChart as RechartsPie, Pie, Cell, Area, AreaChart
} from 'recharts';

interface Model {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'training' | 'paused' | 'completed' | 'error';
  accuracy: number;
  progress: number;
  epochs: number;
  created_at: string;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  gpu_usage: number;
  disk_usage: number;
  active_connections: number;
  uptime: number;
}

interface LegalCategory {
  name: string;
  models: number;
  accuracy: number;
  documents: number;
  color: string;
}

export default function EnhancedPersianDashboard() {
  const [models, setModels] = useState<Model[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [trainingExpanded, setTrainingExpanded] = useState(true);
  const [metricsExpanded, setMetricsExpanded] = useState(true);

  // Legal categories specific to Iranian law
  const legalCategories: LegalCategory[] = [
    { name: 'قوانین مدنی', models: 4, accuracy: 94.2, documents: 15400, color: '#10b981' },
    { name: 'قوانین جزایی', models: 3, accuracy: 91.8, documents: 12800, color: '#3b82f6' },
    { name: 'قوانین تجاری', models: 2, accuracy: 88.5, documents: 8900, color: '#06b6d4' },
    { name: 'قوانین اداری', models: 2, accuracy: 92.1, documents: 11200, color: '#8b5cf6' },
    { name: 'قوانین قضایی', models: 1, accuracy: 87.3, documents: 6700, color: '#f59e0b' }
  ];

  // Performance data over time
  const performanceData = [
    { epoch: 1, accuracy: 45, loss: 2.3, time: '09:00' },
    { epoch: 5, accuracy: 67, loss: 1.8, time: '09:15' },
    { epoch: 10, accuracy: 78, loss: 1.2, time: '09:30' },
    { epoch: 15, accuracy: 85, loss: 0.9, time: '09:45' },
    { epoch: 20, accuracy: 91, loss: 0.6, time: '10:00' },
    { epoch: 25, accuracy: 94, loss: 0.4, time: '10:15' }
  ];

  // Sidebar menu items
  const sidebarMenuItems = [
    { icon: Home, label: 'نمای کلی سیستم', active: true, badge: null, path: '/overview' },
    { icon: Brain, label: 'مدیریت مدل‌ها', active: false, badge: '4', path: '/models' },
    { icon: Database, label: 'مجموعه داده‌ها', active: false, badge: null, path: '/datasets' },
    { icon: BarChart3, label: 'تحلیل و گزارش', active: false, badge: null, path: '/analytics' },
    { icon: FileText, label: 'اسناد حقوقی', active: false, badge: '12K', path: '/docs' },
    { icon: Users, label: 'مدیریت کاربران', active: false, badge: null, path: '/users' },
    { icon: Settings, label: 'تنظیمات سیستم', active: false, badge: null, path: '/settings' },
  ];

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Mock data for Iranian legal models
      setModels([
        {
          id: 'model-001',
          name: 'مدل قوانین مدنی - نسخه پیشرفته',
          type: 'civil-law',
          status: 'training',
          accuracy: 87.5,
          progress: 65,
          epochs: 15,
          created_at: new Date().toISOString()
        },
        {
          id: 'model-002',
          name: 'مدل قوانین جزایی - نسخه تخصصی',
          type: 'criminal-law',
          status: 'completed',
          accuracy: 92.3,
          progress: 100,
          epochs: 25,
          created_at: new Date().toISOString()
        },
        {
          id: 'model-003',
          name: 'مدل قوانین تجاری - نسخه جامع',
          type: 'commercial-law',
          status: 'paused',
          accuracy: 78.9,
          progress: 40,
          epochs: 8,
          created_at: new Date().toISOString()
        },
        {
          id: 'model-004',
          name: 'مدل قوانین اداری - نسخه ویژه',
          type: 'administrative-law',
          status: 'idle',
          accuracy: 0,
          progress: 0,
          epochs: 0,
          created_at: new Date().toISOString()
        }
      ]);

      // Mock metrics
      setMetrics({
        cpu_usage: Math.floor(Math.random() * 30 + 40),
        memory_usage: Math.floor(Math.random() * 20 + 60),
        gpu_usage: Math.floor(Math.random() * 40 + 50),
        disk_usage: Math.floor(Math.random() * 15 + 75),
        active_connections: Math.floor(Math.random() * 10 + 15),
        uptime: Math.floor(Math.random() * 86400 + 3600)
      });

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return <Play className="w-5 h-5 text-white" />;
      case 'paused': return <Pause className="w-5 h-5 text-white" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-white" />;
      default: return <Square className="w-5 h-5 text-white" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'training': return 'در حال آموزش';
      case 'paused': return 'متوقف';
      case 'completed': return 'تکمیل شده';
      case 'error': return 'خطا';
      default: return 'آماده';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training': return 'from-emerald-500 via-teal-500 to-cyan-500';
      case 'paused': return 'from-amber-500 via-orange-500 to-red-500';
      case 'completed': return 'from-emerald-500 via-green-500 to-teal-500';
      case 'error': return 'from-red-500 via-pink-500 to-purple-500';
      default: return 'from-slate-500 via-gray-500 to-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative"
        >
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full relative z-10"
          />
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">در حال بارگذاری...</h2>
          <p className="text-cyan-200 text-lg relative z-10">آماده‌سازی سیستم هوش مصنوعی حقوقی</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900" dir="rtl">
      {/* Enhanced Modern Sidebar */}
      <motion.div
        initial={{ x: sidebarCollapsed ? -300 : 0 }}
        animate={{ x: sidebarCollapsed ? -240 : 0 }}
        className={`fixed right-0 top-0 h-full z-40 transition-all duration-500 ${
          sidebarCollapsed ? 'w-20' : 'w-80'
        }`}
      >
        {/* Sidebar glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-purple-500/10 blur-xl" />
        
        <div className="h-full bg-gradient-to-b from-slate-800/95 via-slate-900/95 to-purple-900/95 backdrop-blur-2xl border-l border-cyan-400/20 shadow-2xl shadow-cyan-500/10 relative z-10">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-cyan-400/20 relative">
            {/* Header glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 blur-sm" />
            
            <div className="flex items-center justify-between relative z-10">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/30 relative">
                    <Brain className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-2xl blur-lg animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-cyan-100 bg-clip-text">AI حقوقی ایران</h2>
                    <p className="text-sm text-cyan-200">سامانه یادگیری عمیق</p>
                  </div>
                </motion.div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-3 hover:bg-cyan-500/10 rounded-xl transition-all duration-300 group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur-sm group-hover:blur-md transition-all" />
                <ArrowLeft className={`w-5 h-5 text-cyan-300 transition-transform duration-500 relative z-10 ${
                  sidebarCollapsed ? 'rotate-180' : ''
                }`} />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-4">
            <div className="space-y-3">
              {sidebarMenuItems.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative ${
                    item.active 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 shadow-lg shadow-cyan-500/10' 
                      : 'hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-purple-500/10 border border-transparent hover:border-cyan-400/20'
                  }`}
                >
                  {/* Button glow */}
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                    item.active 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-lg' 
                      : 'group-hover:bg-gradient-to-r group-hover:from-cyan-500/5 group-hover:to-purple-500/5 group-hover:blur-lg'
                  }`} />
                  
                  <div className={`p-3 rounded-xl shadow-lg relative z-10 ${
                    item.active 
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 shadow-cyan-500/30' 
                      : 'bg-slate-700/60 group-hover:bg-gradient-to-r group-hover:from-cyan-500/70 group-hover:to-purple-600/70'
                  }`}>
                    <item.icon className={`w-5 h-5 ${
                      item.active ? 'text-white' : 'text-cyan-200'
                    }`} />
                  </div>
                  
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-right relative z-10">
                      <span className={`text-sm font-semibold ${
                        item.active ? 'text-white' : 'text-cyan-100'
                      }`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="float-left bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs px-2.5 py-1 rounded-full shadow-lg">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {!sidebarCollapsed && (
                    <ChevronRight className="w-4 h-4 text-cyan-300 group-hover:text-white transition-colors relative z-10" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* System Status Section */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mb-4 relative"
            >
              <button
                onClick={() => setTrainingExpanded(!trainingExpanded)}
                className="w-full p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 relative group"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1], 
                        rotate: [0, 360, 720] 
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30"
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <span className="text-sm font-bold text-emerald-200">وضعیت سیستم</span>
                      <div className="text-xs text-emerald-300">سالم و فعال</div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: trainingExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronUp className="w-4 h-4 text-emerald-300" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {trainingExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-3 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-400/20 relative"
                  >
                    {/* Content glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl blur-sm" />
                    
                    <div className="space-y-3 text-xs relative z-10">
                      <div className="flex items-center justify-between p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-200">مدل‌های در حال آموزش</span>
                        </div>
                        <span className="font-bold text-emerald-300">2</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-cyan-500/20 rounded-xl border border-cyan-400/30 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-3 h-3 text-cyan-400" />
                          <span className="text-cyan-200">استفاده CPU</span>
                        </div>
                        <span className="font-bold text-cyan-300">{metrics?.cpu_usage}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-xl border border-purple-400/30 shadow-sm">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-200">استفاده حافظه</span>
                        </div>
                        <span className="font-bold text-purple-300">{metrics?.memory_usage}%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Footer */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className="text-center text-xs text-slate-400 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="text-slate-300 mb-1">نسخه 2.1.0</div>
                <div>سیستم هوش مصنوعی حقوقی ایران</div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-500 ${sidebarCollapsed ? 'mr-20' : 'mr-80'}`}>
        {/* Top Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800/95 to-purple-800/95 backdrop-blur-xl border-b border-cyan-400/20 p-6 relative"
        >
          {/* Header glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 blur-sm" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-cyan-500/30 relative">
                <Brain className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-3xl blur-lg animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text">داشبورد هوش مصنوعی حقوقی</h1>
                <p className="text-cyan-200">مانیتورینگ و مدیریت مدل‌های یادگیری عمیق</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 shadow-lg shadow-emerald-500/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                <div>
                  <div className="text-xs text-emerald-300">آخرین بروزرسانی</div>
                  <div className="text-sm font-medium text-emerald-200">
                    {lastUpdate.toLocaleTimeString('fa-IR')}
                  </div>
                </div>
              </div>
              
              <button className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
                <Bell className="w-5 h-5 relative z-10" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="p-6 space-y-8">
          {/* Key Metrics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: 'سلامت سیستم', value: '94%', icon: Heart, color: 'emerald', trend: '+2%' },
              { title: 'دقت میانگین', value: '89%', icon: Target, color: 'blue', trend: '+5%' },
              { title: 'نرخ موفقیت', value: '87%', icon: Award, color: 'purple', trend: '+3%' },
              { title: 'مدل‌های فعال', value: '3', icon: Brain, color: 'cyan', trend: '+1' },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group cursor-pointer"
              >
                {/* Triple glow layers */}
                <div className={`absolute inset-0 bg-gradient-to-r from-${metric.color}-500/30 to-${metric.color}-600/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-70 group-hover:opacity-100`} />
                <div className={`absolute inset-0 bg-gradient-to-r from-${metric.color}-500/20 to-${metric.color}-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300`} />
                <div className={`absolute inset-0 bg-gradient-to-r from-${metric.color}-500/10 to-${metric.color}-600/10 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-200`} />
                
                {/* Card Content */}
                <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-600 rounded-2xl shadow-xl shadow-${metric.color}-500/30`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-full bg-${metric.color}-500/20 text-${metric.color}-300 border border-${metric.color}-400/30`}>
                      {metric.trend}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{metric.value}</div>
                  <div className="text-slate-300 text-sm font-medium">{metric.title}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>