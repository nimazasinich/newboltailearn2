#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Enhanced Persian MCP Server with improved functionality
class EnhancedPersianMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'persian-mcp-server-enhanced',
        version: '4.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Configuration
    this.memoryPath = process.env.MEMORY_PATH || './cursor-memory';
    this.formsPath = process.env.FORMS_PATH || './generated-forms';
    this.backupsPath = path.join(this.memoryPath, 'backups');
    this.maxBackups = 10;
    this.maxMemoryItems = 1000; // Prevent excessive memory usage
    
    // Initialize
    this.ensureDirectories();
    this.setupErrorHandling();
    this.setupToolHandlers();
    this.startPeriodicBackup();
    
    this.log('سرور MCP فارسی پیشرفته راه‌اندازی شد');
  }

  // Enhanced directory setup
  ensureDirectories() {
    const dirs = [this.memoryPath, this.formsPath, this.backupsPath];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`پوشه ایجاد شد: ${dir}`);
      }
    });
  }

  // Comprehensive error handling
  setupErrorHandling() {
    process.on('uncaughtException', (error) => {
      this.log(`خطای سیستم: ${error.message}`, 'error');
      console.error('Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (reason) => {
      this.log(`Promise رد شده: ${reason}`, 'error');
      console.error('Unhandled Rejection:', reason);
    });
  }

  // Enhanced logging system
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Console output
    if (level === 'error') {
      console.error(logEntry);
    } else {
      console.error(logEntry); // Use stderr for MCP compatibility
    }

    // File logging
    try {
      const logFile = path.join(this.memoryPath, 'server.log');
      fs.appendFileSync(logFile, logEntry + '\n');
      
      // Rotate log if too large (>1MB)
      const stats = fs.statSync(logFile);
      if (stats.size > 1024 * 1024) {
        const backupLog = path.join(this.backupsPath, `server-${Date.now()}.log`);
        fs.renameSync(logFile, backupLog);
        this.cleanupOldLogs();
      }
    } catch (error) {
      console.error('Logging error:', error.message);
    }
  }

  // Cleanup old log files
  cleanupOldLogs() {
    try {
      const logFiles = fs.readdirSync(this.backupsPath)
        .filter(f => f.startsWith('server-') && f.endsWith('.log'))
        .map(f => ({
          name: f,
          path: path.join(this.backupsPath, f),
          time: fs.statSync(path.join(this.backupsPath, f)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the 5 most recent log files
      logFiles.slice(5).forEach(log => {
        fs.unlinkSync(log.path);
        this.log(`لاگ قدیمی حذف شد: ${log.name}`);
      });
    } catch (error) {
      this.log(`خطا در پاکسازی لاگ‌ها: ${error.message}`, 'error');
    }
  }

  // Automatic backup system
  startPeriodicBackup() {
    // Backup every 30 minutes
    setInterval(() => {
      this.createBackup();
    }, 30 * 60 * 1000);

    // Initial backup
    setTimeout(() => this.createBackup(), 5000);
  }

  // Create backup of memory files
  createBackup() {
    try {
      const backupId = Date.now();
      const backupDir = path.join(this.backupsPath, `backup-${backupId}`);
      fs.mkdirSync(backupDir, { recursive: true });

      const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
      let backedUpFiles = 0;

      files.forEach(file => {
        const sourcePath = path.join(this.memoryPath, file);
        const backupPath = path.join(backupDir, file);
        fs.copyFileSync(sourcePath, backupPath);
        backedUpFiles++;
      });

      if (backedUpFiles > 0) {
        this.log(`پشتیبان‌گیری انجام شد: ${backedUpFiles} فایل`);
        this.cleanupOldBackups();
      }
    } catch (error) {
      this.log(`خطا در پشتیبان‌گیری: ${error.message}`, 'error');
    }
  }

  // Cleanup old backups
  cleanupOldBackups() {
    try {
      const backups = fs.readdirSync(this.backupsPath)
        .filter(f => f.startsWith('backup-'))
        .map(f => ({
          name: f,
          path: path.join(this.backupsPath, f),
          time: parseInt(f.replace('backup-', ''))
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the most recent backups
      backups.slice(this.maxBackups).forEach(backup => {
        fs.rmSync(backup.path, { recursive: true, force: true });
        this.log(`پشتیبان قدیمی حذف شد: ${backup.name}`);
      });
    } catch (error) {
      this.log(`خطا در پاکسازی پشتیبان‌ها: ${error.message}`, 'error');
    }
  }

  // Safe file operations with error handling
  safeFileOperation(operation, filePath, data = null) {
    try {
      switch (operation) {
        case 'read': {
          if (!fs.existsSync(filePath)) return [];
          const content = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(content);
        }
        
        case 'write': {
          // Create backup before writing
          if (fs.existsSync(filePath)) {
            const backupPath = `${filePath}.backup`;
            fs.copyFileSync(filePath, backupPath);
          }
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
          return true;
        }
        
        default:
          throw new Error(`عملیات نامعلوم: ${operation}`);
      }
    } catch (error) {
      this.log(`خطا در عملیات فایل ${operation}: ${error.message}`, 'error');
      
      // Try to restore from backup on write failure
      if (operation === 'write' && fs.existsSync(`${filePath}.backup`)) {
        try {
          fs.copyFileSync(`${filePath}.backup`, filePath);
          this.log(`فایل از پشتیبان بازیابی شد: ${filePath}`);
        } catch (restoreError) {
          this.log(`خطا در بازیابی: ${restoreError.message}`, 'error');
        }
      }
      
      throw error;
    }
  }

  // Enhanced fuzzy search
  fuzzySearch(query, text) {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest score
    if (textLower.includes(queryLower)) return 100;
    
    // Calculate similarity score
    let score = 0;
    const queryChars = queryLower.split('');
    let textIndex = 0;
    
    for (const char of queryChars) {
      const foundIndex = textLower.indexOf(char, textIndex);
      if (foundIndex !== -1) {
        score += 1;
        textIndex = foundIndex + 1;
      }
    }
    
    return (score / queryChars.length) * 80; // Max 80 for fuzzy matches
  }

  setupToolHandlers() {
    // Enhanced tool list with new features
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'persian_memory_save',
            description: 'ذخیره اطلاعات در حافظه فارسی با قابلیت‌های پیشرفته - استفاده: "در حافظت ذخیره کن [نوع]: [محتوا]"',
            inputSchema: {
              type: 'object',
              properties: {
                content: { type: 'string', description: 'محتوای مورد نظر برای ذخیره' },
                category: { type: 'string', description: 'نوع دسته‌بندی (notes, projects, ideas, tasks)' },
                tags: { type: 'string', description: 'برچسب‌ها (اختیاری)' },
                priority: { type: 'string', description: 'اولویت (low, medium, high)' }
              },
              required: ['content']
            }
          },
          {
            name: 'persian_memory_recall',
            description: 'بازیابی هوشمند اطلاعات از حافظه فارسی - استفاده: "یادت میاد [چیزی]؟"',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'کلمه کلیدی برای جستجو' },
                category: { type: 'string', description: 'محدود کردن جستجو به دسته خاص (اختیاری)' },
                limit: { type: 'number', description: 'حداکثر تعداد نتایج (پیش‌فرض: 10)' }
              },
              required: ['query']
            }
          },
          {
            name: 'persian_memory_list',
            description: 'نمایش لیست کامل حافظه با فیلترینگ - استفاده: "لیست چی تو حافظت هست"',
            inputSchema: {
              type: 'object',
              properties: {
                category: { type: 'string', description: 'فیلتر بر اساس دسته (اختیاری)' },
                sortBy: { type: 'string', description: 'مرتب‌سازی بر اساس (date, priority, category)' }
              },
              required: []
            }
          },
          {
            name: 'persian_memory_forget',
            description: 'فراموش کردن هوشمند موارد - استفاده: "فراموش کن [چیزی]"',
            inputSchema: {
              type: 'object',
              properties: {
                item: { type: 'string', description: 'مورد مورد نظر برای فراموش کردن' },
                confirm: { type: 'boolean', description: 'تأیید حذف' }
              },
              required: ['item']
            }
          },
          {
            name: 'persian_form_generator',
            description: 'ساخت فرم HTML فارسی پیشرفته - استفاده: "یه فرم [نوع] بساز"',
            inputSchema: {
              type: 'object',
              properties: {
                formType: { type: 'string', description: 'نوع فرم (contact, registration, survey, feedback, custom)' },
                style: { type: 'string', description: 'سبک فرم (simple, advanced, modern, classic)' },
                customFields: { type: 'string', description: 'فیلدهای سفارشی (JSON format)' }
              },
              required: ['formType']
            }
          },
          {
            name: 'persian_memory_export',
            description: 'صادرات داده‌های حافظه - استفاده: "صادرات حافظه"',
            inputSchema: {
              type: 'object',
              properties: {
                format: { type: 'string', description: 'فرمت صادرات (json, csv, txt)' },
                category: { type: 'string', description: 'دسته خاص برای صادرات (اختیاری)' }
              },
              required: []
            }
          },
          {
            name: 'persian_memory_import',
            description: 'وارد کردن داده‌ها به حافظه - استفاده: "وارد کردن داده‌ها"',
            inputSchema: {
              type: 'object',
              properties: {
                data: { type: 'string', description: 'داده‌های JSON برای وارد کردن' },
                merge: { type: 'boolean', description: 'ادغام با داده‌های موجود' }
              },
              required: ['data']
            }
          },
          {
            name: 'persian_memory_stats',
            description: 'آمار و اطلاعات حافظه - استفاده: "آمار حافظه"',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          }
        ]
      };
    });

    // Enhanced tool handlers
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        this.log(`اجرای ابزار: ${name} با پارامترها: ${JSON.stringify(args)}`);

        switch (name) {
          case 'persian_memory_save':
            return await this.handleEnhancedMemorySave(args.content, args.category, args.tags, args.priority);
          
          case 'persian_memory_recall':
            return await this.handleEnhancedMemoryRecall(args.query, args.category, args.limit);
          
          case 'persian_memory_list':
            return await this.handleEnhancedMemoryList(args.category, args.sortBy);
          
          case 'persian_memory_forget':
            return await this.handleEnhancedMemoryForget(args.item, args.confirm);
          
          case 'persian_form_generator':
            return await this.handleEnhancedFormGenerator(args.formType, args.style, args.customFields);
          
          case 'persian_memory_export':
            return await this.handleMemoryExport(args.format, args.category);
          
          case 'persian_memory_import':
            return await this.handleMemoryImport(args.data, args.merge);
          
          case 'persian_memory_stats':
            return await this.handleMemoryStats();
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `ابزار ناشناخته: ${name}`
            );
        }
      } catch (error) {
        this.log(`خطا در اجرای ${name}: ${error.message}`, 'error');
        throw new McpError(
          ErrorCode.InternalError,
          `خطا در اجرای ${name}: ${error.message}`
        );
      }
    });
  }

  // Enhanced memory save with tags and priority
  async handleEnhancedMemorySave(content, category, tags, priority) {
    if (!category) {
      return {
        content: [{
          type: 'text',
          text: `🧠 انتخاب نوع ذخیره‌سازی برای: "${content}"\n\n` +
                `1️⃣ یادداشت (notes) - برای یادداشت‌های کلی\n` +
                `2️⃣ پروژه (projects) - برای ایده‌های پروژه\n` +
                `3️⃣ ایده (ideas) - برای ایده‌های خلاقانه\n` +
                `4️⃣ کار (tasks) - برای کارهای انجام دادنی\n\n` +
                `💡 نکته: می‌توانید برچسب و اولویت نیز اضافه کنید\n` +
                `لطفاً شماره گزینه مورد نظر را بگویید: "گزینه 1" یا "1"`
        }]
      };
    }

    const categoryMap = {
      '1': 'notes', '2': 'projects', '3': 'ideas', '4': 'tasks'
    };
    
    const finalCategory = categoryMap[category] || category;
    const filePath = path.join(this.memoryPath, `${finalCategory}.json`);
    
    // Check memory limit
    const existingData = this.safeFileOperation('read', filePath);
    if (existingData.length >= this.maxMemoryItems) {
      return {
        content: [{
          type: 'text',
          text: `⚠️ حافظه پر است! حداکثر ${this.maxMemoryItems} مورد مجاز است.\n` +
                `لطفاً ابتدا برخی موارد را حذف کنید.`
        }]
      };
    }

    const newItem = {
      id: crypto.randomUUID(),
      content: content,
      timestamp: new Date().toISOString(),
      category: finalCategory,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      priority: priority || 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    existingData.push(newItem);
    this.safeFileOperation('write', filePath, existingData);
    
    this.log(`آیتم جدید ذخیره شد: ${finalCategory} - ${content.substring(0, 50)}`);
    
    return {
      content: [{
        type: 'text',
        text: `✅ ذخیره شد در دسته "${finalCategory}"\n` +
              `📝 محتوا: ${content}\n` +
              `🏷️ برچسب‌ها: ${newItem.tags.join(', ') || 'ندارد'}\n` +
              `⭐ اولویت: ${priority || 'متوسط'}\n` +
              `🆔 شناسه: ${newItem.id.substring(0, 8)}`
      }]
    };
  }

  // Enhanced memory recall with fuzzy search
  async handleEnhancedMemoryRecall(query, category, limit = 10) {
    const results = [];
    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      const data = this.safeFileOperation('read', filePath);
      
      for (const item of data) {
        // Skip if category filter doesn't match
        if (category && item.category !== category) continue;
        
        // Calculate search score
        const contentScore = this.fuzzySearch(query, item.content);
        const tagsScore = item.tags ? 
          Math.max(...item.tags.map(tag => this.fuzzySearch(query, tag))) : 0;
        
        const maxScore = Math.max(contentScore, tagsScore);
        
        if (maxScore > 30) { // Minimum similarity threshold
          results.push({
            ...item,
            searchScore: maxScore
          });
        }
      }
    }
    
    if (results.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `❌ چیزی با کلیدواژه "${query}" پیدا نشد\n` +
                `💡 نکته: از کلمات کلیدی مختلف امتحان کنید`
        }]
      };
    }
    
    // Sort by search score and limit results
    results.sort((a, b) => b.searchScore - a.searchScore);
    const limitedResults = results.slice(0, limit);
    
    const resultText = limitedResults.map((item, index) => {
      const priorityIcon = item.priority === 'high' ? '🔴' : 
                          item.priority === 'medium' ? '🟡' : '🟢';
      const tagsText = item.tags && item.tags.length > 0 ? 
        ` [${item.tags.join(', ')}]` : '';
      
      return `${index + 1}. ${priorityIcon} ${item.category}: ${item.content}${tagsText}\n` +
             `   📅 ${new Date(item.timestamp).toLocaleDateString('fa-IR')} | ` +
             `🎯 امتیاز: ${Math.round(item.searchScore)}%`;
    }).join('\n\n');
    
    return {
      content: [{
        type: 'text',
        text: `🔍 نتایج جستجو برای "${query}" (${limitedResults.length} از ${results.length}):\n\n${resultText}\n\n` +
              `💡 برای نتایج بیشتر، جستجوی دقیق‌تری انجام دهید.`
      }]
    };
  }

  // Enhanced memory list with sorting and filtering
  async handleEnhancedMemoryList(category, sortBy = 'date') {
    const allItems = [];
    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      const data = this.safeFileOperation('read', filePath);
      allItems.push(...data);
    }
    
    if (allItems.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `📭 حافظه خالی است\n💡 با دستور "در حافظت ذخیره کن" شروع کنید`
        }]
      };
    }

    // Filter by category if specified
    let filteredItems = category ? 
      allItems.filter(item => item.category === category) : allItems;

    // Sort items
    switch (sortBy) {
      case 'priority': {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        filteredItems.sort((a, b) => 
          (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2));
        break;
      }
      case 'category': {
        filteredItems.sort((a, b) => a.category.localeCompare(b.category));
        break;
      }
      default: // date
        filteredItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Group by category
    const grouped = filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    
    let listText = `📚 محتویات حافظه (${filteredItems.length} مورد):\n\n`;
    
    for (const [cat, items] of Object.entries(grouped)) {
      listText += `🗂️ ${cat} (${items.length} مورد):\n`;
      items.forEach((item, index) => {
        const priorityIcon = item.priority === 'high' ? '🔴' : 
                            item.priority === 'medium' ? '🟡' : '🟢';
        const tagsText = item.tags && item.tags.length > 0 ? 
          ` [${item.tags.join(', ')}]` : '';
        const shortContent = item.content.length > 60 ? 
          item.content.substring(0, 60) + '...' : item.content;
        
        listText += `  ${index + 1}. ${priorityIcon} ${shortContent}${tagsText}\n`;
      });
      listText += '\n';
    }
    
    return {
      content: [{
        type: 'text',
        text: listText + `📊 مرتب‌سازی: ${sortBy === 'date' ? 'تاریخ' : 
                                        sortBy === 'priority' ? 'اولویت' : 'دسته'}`
      }]
    };
  }

  // Enhanced memory forget with confirmation
  async handleEnhancedMemoryForget(item, confirm = false) {
    if (!confirm) {
      return {
        content: [{
          type: 'text',
          text: `⚠️ آیا مطمئن هستید که می‌خواهید "${item}" را فراموش کنم؟\n\n` +
                `این عمل قابل بازگشت نیست!\n\n` +
                `برای تأیید، دوباره همین دستور را با "تأیید" بفرمایید:\n` +
                `"فراموش کن ${item} تأیید"`
        }]
      };
    }

    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    let found = false;
    let deletedItems = [];
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      const data = this.safeFileOperation('read', filePath);
      const initialLength = data.length;
      
      const remainingData = data.filter(entry => {
        const shouldDelete = entry.content.toLowerCase().includes(item.toLowerCase()) ||
                           (entry.tags && entry.tags.some(tag => 
                             tag.toLowerCase().includes(item.toLowerCase())));
        
        if (shouldDelete) {
          deletedItems.push(entry);
          return false;
        }
        return true;
      });
      
      if (remainingData.length < initialLength) {
        found = true;
        this.safeFileOperation('write', filePath, remainingData);
      }
    }
    
    if (found) {
      this.log(`موارد حذف شده: ${deletedItems.length} مورد - ${item}`);
      return {
        content: [{
          type: 'text',
          text: `🗑️ فراموش شد: ${deletedItems.length} مورد\n\n` +
                deletedItems.map(deleted => 
                  `• ${deleted.content.substring(0, 50)}...`).join('\n') +
                `\n\n💾 پشتیبان‌گیری خودکار انجام شده است.`
        }]
      };
    } else {
      return {
        content: [{
          type: 'text',
          text: `❌ چیزی با "${item}" پیدا نشد\n` +
                `💡 از دستور "لیست چی تو حافظت هست" برای مشاهده موارد موجود استفاده کنید`
        }]
      };
    }
  }

  // Memory statistics
  async handleMemoryStats() {
    const stats = {
      totalItems: 0,
      categories: {},
      priorities: { high: 0, medium: 0, low: 0 },
      tags: {},
      oldestItem: null,
      newestItem: null,
      averageContentLength: 0
    };

    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    let allItems = [];
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      const data = this.safeFileOperation('read', filePath);
      allItems.push(...data);
    }

    if (allItems.length === 0) {
      return {
        content: [{
          type: 'text',
          text: '📊 آمار حافظه: خالی است'
        }]
      };
    }

    // Calculate statistics
    stats.totalItems = allItems.length;
    let totalContentLength = 0;

    allItems.forEach(item => {
      // Categories
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
      
      // Priorities
      if (item.priority && Object.prototype.hasOwnProperty.call(stats.priorities, item.priority)) {
        stats.priorities[item.priority]++;
      }
      
      // Tags
      if (item.tags) {
        item.tags.forEach(tag => {
          stats.tags[tag] = (stats.tags[tag] || 0) + 1;
        });
      }
      
      // Content length
      totalContentLength += item.content.length;
      
      // Dates
      const itemDate = new Date(item.timestamp);
      if (!stats.oldestItem || itemDate < new Date(stats.oldestItem.timestamp)) {
        stats.oldestItem = item;
      }
      if (!stats.newestItem || itemDate > new Date(stats.newestItem.timestamp)) {
        stats.newestItem = item;
      }
    });

    stats.averageContentLength = Math.round(totalContentLength / allItems.length);

    // Format results
    const categoryStats = Object.entries(stats.categories)
      .map(([cat, count]) => `  • ${cat}: ${count} مورد`)
      .join('\n');

    const priorityStats = `  • بالا: ${stats.priorities.high} | متوسط: ${stats.priorities.medium} | پایین: ${stats.priorities.low}`;

    const topTags = Object.entries(stats.tags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => `${tag}(${count})`)
      .join(', ');

    return {
      content: [{
        type: 'text',
        text: `📊 آمار کامل حافظه:\n\n` +
              `📈 کل موارد: ${stats.totalItems}\n` +
              `📁 دسته‌بندی‌ها:\n${categoryStats}\n\n` +
              `⭐ اولویت‌ها:\n${priorityStats}\n\n` +
              `🏷️ برچسب‌های پرکاربرد: ${topTags || 'ندارد'}\n\n` +
              `📏 متوسط طول محتوا: ${stats.averageContentLength} کاراکتر\n` +
              `📅 قدیمی‌ترین: ${new Date(stats.oldestItem.timestamp).toLocaleDateString('fa-IR')}\n` +
              `📅 جدیدترین: ${new Date(stats.newestItem.timestamp).toLocaleDateString('fa-IR')}\n\n` +
              `💾 فضای استفاده شده: ${Math.round((stats.totalItems / this.maxMemoryItems) * 100)}%`
      }]
    };
  }

  // Memory export functionality
  async handleMemoryExport(format = 'json', category) {
    const allItems = [];
    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      const data = this.safeFileOperation('read', filePath);
      allItems.push(...data);
    }

    let exportData = category ? 
      allItems.filter(item => item.category === category) : allItems;

    if (exportData.length === 0) {
      return {
        content: [{
          type: 'text',
          text: '❌ داده‌ای برای صادرات یافت نشد'
        }]
      };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `memory-export-${category || 'all'}-${timestamp}`;
    let filePath, content;

    switch (format) {
      case 'csv':
        content = 'Category,Content,Tags,Priority,Timestamp\n' +
          exportData.map(item => 
            `"${item.category}","${item.content.replace(/"/g, '""')}","${(item.tags || []).join(';')}","${item.priority || 'medium'}","${item.timestamp}"`
          ).join('\n');
        filePath = path.join(this.memoryPath, `${fileName}.csv`);
        break;
      
      case 'txt':
        content = exportData.map(item => 
          `[${item.category}] ${item.content}\n` +
          `Tags: ${(item.tags || []).join(', ')}\n` +
          `Priority: ${item.priority || 'medium'}\n` +
          `Date: ${new Date(item.timestamp).toLocaleDateString('fa-IR')}\n` +
          '---\n'
        ).join('\n');
        filePath = path.join(this.memoryPath, `${fileName}.txt`);
        break;
      
      default: // json
        content = JSON.stringify({
          exportDate: new Date().toISOString(),
          totalItems: exportData.length,
          category: category || 'all',
          data: exportData
        }, null, 2);
        filePath = path.join(this.memoryPath, `${fileName}.json`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    this.log(`صادرات انجام شد: ${exportData.length} مورد در فرمت ${format}`);

    return {
      content: [{
        type: 'text',
        text: `✅ صادرات با موفقیت انجام شد!\n\n` +
              `📁 فایل: ${path.basename(filePath)}\n` +
              `📊 تعداد موارد: ${exportData.length}\n` +
              `📂 مسیر: ${filePath}\n` +
              `📋 فرمت: ${format.toUpperCase()}`
      }]
    };
  }

  // Memory import functionality  
  async handleMemoryImport(data, merge = true) {
    try {
      const importData = JSON.parse(data);
      
      if (!Array.isArray(importData.data)) {
        throw new Error('فرمت داده نامعتبر است');
      }

      let importedCount = 0;
      const categories = {};

      for (const item of importData.data) {
        if (!item.content || !item.category) continue;

        const filePath = path.join(this.memoryPath, `${item.category}.json`);
        const existingData = this.safeFileOperation('read', filePath);
        
        // Check for duplicates if merging
        if (merge) {
          const isDuplicate = existingData.some(existing => 
            existing.content === item.content && 
            existing.category === item.category
          );
          if (isDuplicate) continue;
        }

        const newItem = {
          ...item,
          id: item.id || crypto.randomUUID(),
          timestamp: item.timestamp || new Date().toISOString(),
          updatedAt: Date.now()
        };

        existingData.push(newItem);
        this.safeFileOperation('write', filePath, existingData);
        
        importedCount++;
        categories[item.category] = (categories[item.category] || 0) + 1;
      }

      this.log(`وارد کردن داده‌ها: ${importedCount} مورد`);

      const categoryStats = Object.entries(categories)
        .map(([cat, count]) => `• ${cat}: ${count} مورد`)
        .join('\n');

      return {
        content: [{
          type: 'text',
          text: `✅ وارد کردن با موفقیت انجام شد!\n\n` +
                `📊 تعداد موارد وارد شده: ${importedCount}\n` +
                `📁 دسته‌بندی‌ها:\n${categoryStats}\n\n` +
                `🔄 حالت: ${merge ? 'ادغام با داده‌های موجود' : 'جایگزین کامل'}`
        }]
      };

    } catch (error) {
      this.log(`خطا در وارد کردن داده‌ها: ${error.message}`, 'error');
      return {
        content: [{
          type: 'text',
          text: `❌ خطا در وارد کردن داده‌ها: ${error.message}\n\n` +
                `💡 مطمئن شوید که فرمت JSON معتبر است`
        }]
      };
    }
  }

  // Enhanced form generator (keeping original functionality + improvements)
  async handleEnhancedFormGenerator(formType, style, customFields) {
    if (!style) {
      return {
        content: [{
          type: 'text',
          text: `🎨 انتخاب سبک فرم "${formType}":\n\n` +
                `1️⃣ ساده (simple) - فرم ساده و کاربردی\n` +
                `2️⃣ پیشرفته (advanced) - فرم کامل با اعتبارسنجی\n` +
                `3️⃣ مدرن (modern) - طراحی مدرن و زیبا\n` +
                `4️⃣ کلاسیک (classic) - سبک سنتی\n\n` +
                `💡 برای فرم سفارشی، نوع "custom" را انتخاب کنید\n` +
                `لطفاً شماره گزینه مورد نظر را بگویید: "گزینه 2" یا "2"`
        }]
      };
    }

    const styleMap = {
      '1': 'simple', '2': 'advanced', '3': 'modern', '4': 'classic'
    };
    
    const finalStyle = styleMap[style] || style;
    
    // Handle custom forms
    if (formType === 'custom' && customFields) {
      try {
        const fields = JSON.parse(customFields);
        const formHTML = this.generateCustomFormHTML(fields, finalStyle);
        const fileName = `custom-${finalStyle}-${Date.now()}.html`;
        const filePath = path.join(this.formsPath, fileName);
        
        fs.writeFileSync(filePath, formHTML, 'utf8');
        
        return {
          content: [{
            type: 'text',
            text: `✅ فرم سفارشی با سبک ${finalStyle} ایجاد شد!\n` +
                  `📁 مسیر: ${filePath}\n\n` +
                  `🔗 برای مشاهده فرم، فایل HTML را در مرورگر باز کنید.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ خطا در پردازش فیلدهای سفارشی: ${error.message}\n\n` +
                  `💡 فرمت JSON معتبر استفاده کنید`
          }]
        };
      }
    }

    // Use original form generation for standard forms
    const formHTML = this.generateFormHTML(formType, finalStyle);
    const fileName = `${formType}-${finalStyle}-${Date.now()}.html`;
    const filePath = path.join(this.formsPath, fileName);
    
    fs.writeFileSync(filePath, formHTML, 'utf8');
    this.log(`فرم ایجاد شد: ${formType} - ${finalStyle}`);
    
    return {
      content: [{
        type: 'text',
        text: `✅ فرم ${formType} با سبک ${finalStyle} ایجاد شد!\n` +
              `📁 مسیر: ${filePath}\n\n` +
              `🔗 برای مشاهده فرم، فایل HTML را در مرورگر باز کنید.\n` +
              `📱 فرم برای موبایل و دسکتاپ بهینه شده است.`
      }]
    };
  }

  // Generate custom form HTML
  generateCustomFormHTML(fields, style) {
    const baseStyles = this.getFormStyles();
    
    let fieldsHTML = '';
    fields.forEach(field => {
      fieldsHTML += '<div class="form-group">';
      fieldsHTML += `<label for="${field.name}">${field.label}${field.required ? ' <span class="required">*</span>' : ''}</label>`;
      
      switch (field.type) {
        case 'textarea':
          fieldsHTML += `<textarea id="${field.name}" name="${field.name}" rows="${field.rows || 4}"${field.required ? ' required' : ''}></textarea>`;
          break;
        case 'select':
          fieldsHTML += `<select id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>`;
          fieldsHTML += '<option value="">انتخاب کنید</option>';
          if (field.options) {
            field.options.forEach(option => {
              fieldsHTML += `<option value="${option}">${option}</option>`;
            });
          }
          fieldsHTML += '</select>';
          break;
        default:
          fieldsHTML += `<input type="${field.type}" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}${field.placeholder ? ` placeholder="${field.placeholder}"` : ''}>`;
      }
      
      fieldsHTML += '</div>';
    });

    return `<!DOCTYPE html>
<html lang="fa">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فرم سفارشی</title>
    <style>${baseStyles[style]}</style>
</head>
<body>
    <div class="container">
        <h2>فرم سفارشی</h2>
        <form method="post" action="#">
            ${fieldsHTML}
            <button type="submit">ارسال</button>
        </form>
    </div>
</body>
</html>`;
  }

  // Get form styles (extracted from original code)
  getFormStyles() {
    return {
      simple: `
        body { font-family: Tahoma, Arial; direction: rtl; margin: 20px; }
        form { max-width: 400px; margin: 0 auto; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea, select { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; }
        button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
        button:hover { background: #005a87; }
        .required { color: red; }
      `,
      advanced: `
        body { font-family: Vazir, Tahoma, Arial; direction: rtl; margin: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 50px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
        input, textarea, select { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; transition: border-color 0.3s; }
        input:focus, textarea:focus, select:focus { border-color: #007cba; outline: none; }
        button { background: linear-gradient(135deg, #007cba, #005a87); color: white; padding: 15px 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; width: 100%; }
        button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .required { color: red; }
      `,
      modern: `
        body { font-family: 'Segoe UI', Tahoma, Arial; direction: rtl; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 500px; margin: 50px auto; background: rgba(255,255,255,0.95); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); }
        h2 { text-align: center; color: #333; margin-bottom: 30px; }
        .form-group { margin-bottom: 25px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; }
        input, textarea, select { width: 100%; padding: 15px; border: none; border-radius: 10px; background: #f8f9fa; font-size: 16px; transition: all 0.3s; }
        input:focus, textarea:focus, select:focus { background: white; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3); outline: none; }
        button { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 18px; border: none; border-radius: 10px; cursor: pointer; font-size: 18px; width: 100%; font-weight: bold; }
        button:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .required { color: red; }
      `,
      classic: `
        body { font-family: Times, serif; direction: rtl; margin: 20px; background: #fafafa; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 25px; border: 2px solid #333; }
        h2 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea, select { width: 100%; padding: 6px; border: 1px solid #666; font-family: inherit; }
        button { background: #333; color: white; padding: 12px 25px; border: 2px solid #333; cursor: pointer; font-family: inherit; width: 100%; }
        button:hover { background: white; color: #333; }
        .required { color: red; }
      `
    };
  }

  // Keep original generateFormHTML method for backward compatibility
  generateFormHTML(formType, style) {
    // [Original implementation remains the same]
    // ... (keeping the original method exactly as it was)
    const baseStyles = this.getFormStyles();

    const formFields = {
      contact: {
        title: 'فرم تماس با ما',
        fields: [
          { name: 'name', label: 'نام و نام خانوادگی', type: 'text', required: true },
          { name: 'email', label: 'ایمیل', type: 'email', required: true },
          { name: 'phone', label: 'تلفن', type: 'tel', required: false },
          { name: 'subject', label: 'موضوع', type: 'text', required: true },
          { name: 'message', label: 'پیام', type: 'textarea', required: true }
        ]
      },
      registration: {
        title: 'فرم ثبت نام',
        fields: [
          { name: 'firstname', label: 'نام', type: 'text', required: true },
          { name: 'lastname', label: 'نام خانوادگی', type: 'text', required: true },
          { name: 'email', label: 'ایمیل', type: 'email', required: true },
          { name: 'password', label: 'رمز عبور', type: 'password', required: true },
          { name: 'confirm_password', label: 'تکرار رمز عبور', type: 'password', required: true },
          { name: 'phone', label: 'شماره تلفن', type: 'tel', required: false },
          { name: 'birthdate', label: 'تاریخ تولد', type: 'date', required: false }
        ]
      },
      survey: {
        title: 'فرم نظرسنجی',
        fields: [
          { name: 'age', label: 'سن', type: 'number', required: false },
          { name: 'gender', label: 'جنسیت', type: 'select', options: ['مرد', 'زن'], required: false },
          { name: 'satisfaction', label: 'میزان رضایت', type: 'select', options: ['بسیار راضی', 'راضی', 'متوسط', 'ناراضی', 'بسیار ناراضی'], required: true },
          { name: 'recommendation', label: 'توصیه به دیگران', type: 'select', options: ['بله', 'خیر', 'مطمئن نیستم'], required: true },
          { name: 'comments', label: 'نظرات و پیشنهادات', type: 'textarea', required: false }
        ]
      },
      feedback: {
        title: 'فرم بازخورد',
        fields: [
          { name: 'name', label: 'نام (اختیاری)', type: 'text', required: false },
          { name: 'email', label: 'ایمیل (اختیاری)', type: 'email', required: false },
          { name: 'rating', label: 'امتیاز', type: 'select', options: ['5 - عالی', '4 - خوب', '3 - متوسط', '2 - ضعیف', '1 - بسیار ضعیف'], required: true },
          { name: 'category', label: 'دسته بندی', type: 'select', options: ['شکایت', 'پیشنهاد', 'تشکر', 'سایر'], required: true },
          { name: 'feedback', label: 'بازخورد شما', type: 'textarea', required: true }
        ]
      }
    };

    const form = formFields[formType] || formFields.contact;
    let fieldsHTML = '';
    
    if (style === 'classic') {
      fieldsHTML = '<table>';
      form.fields.forEach(field => {
        fieldsHTML += `<tr><td><label for="${field.name}">${field.label}${field.required ? ' <span class="required">*</span>' : ''}:</label></td><td>`;
        
        if (field.type === 'textarea') {
          fieldsHTML += `<textarea id="${field.name}" name="${field.name}" rows="4"${field.required ? ' required' : ''}></textarea>`;
        } else if (field.type === 'select') {
          fieldsHTML += `<select id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>`;
          fieldsHTML += '<option value="">انتخاب کنید</option>';
          if (field.options) {
            field.options.forEach(option => {
              fieldsHTML += `<option value="${option}">${option}</option>`;
            });
          }
          fieldsHTML += '</select>';
        } else {
          fieldsHTML += `<input type="${field.type}" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>`;
        }
        
        fieldsHTML += '</td></tr>';
      });
      fieldsHTML += '</table>';
    } else {
      form.fields.forEach(field => {
        fieldsHTML += '<div class="form-group">';
        fieldsHTML += `<label for="${field.name}">${field.label}${field.required ? ' <span class="required">*</span>' : ''}</label>`;
        
        if (field.type === 'textarea') {
          fieldsHTML += `<textarea id="${field.name}" name="${field.name}" rows="4"${field.required ? ' required' : ''}></textarea>`;
        } else if (field.type === 'select') {
          fieldsHTML += `<select id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>`;
          fieldsHTML += '<option value="">انتخاب کنید</option>';
          if (field.options) {
            field.options.forEach(option => {
              fieldsHTML += `<option value="${option}">${option}</option>`;
            });
          }
          fieldsHTML += '</select>';
        } else {
          fieldsHTML += `<input type="${field.type}" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>`;
        }
        
        fieldsHTML += '</div>';
      });
    }

    return `<!DOCTYPE html>
<html lang="fa">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${form.title}</title>
    <style>${baseStyles[style]}</style>
</head>
<body>
    <div class="container">
        <h2>${form.title}</h2>
        <form method="post" action="#">
            ${fieldsHTML}
            <button type="submit">ارسال</button>
        </form>
    </div>
</body>
</html>`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 سرور MCP فارسی پیشرفته راه‌اندازی شد - نسخه 4.0.0');
  }
}

const server = new EnhancedPersianMCPServer();
server.run().catch(console.error);
