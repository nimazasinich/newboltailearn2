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

// Intelligent Persian MCP Server - Smart Keyword Detection & Token Optimization
class IntelligentPersianMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'intelligent-persian-mcp-server',
        version: '6.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Paths
    this.memoryPath = process.env.MEMORY_PATH || './cursor-memory';
    this.outputPath = process.env.OUTPUT_PATH || './cursor-outputs';
    this.templatesPath = process.env.TEMPLATES_PATH || './cursor-templates';
    
    // Smart Keyword System
    this.keywords = this.initializeKeywords();
    this.contextHistory = [];
    this.userPreferences = this.loadUserPreferences();
    
    this.ensureDirectories();
    this.setupToolHandlers();
    
    this.log('🧠 سرور MCP هوشمند با تشخیص کلمات کلیدی آماده!');
  }

  // Initialize comprehensive keyword system
  initializeKeywords() {
    return {
      // Button Creation Keywords
      button: {
        fa: ['دکمه', 'کلید', 'بتن', 'دکمه‌ای', 'کلیک', 'فشار', 'تاچ'],
        en: ['button', 'btn', 'click', 'press', 'tap', 'touch', 'cta', 'action'],
        context: ['ساخت', 'بساز', 'درست کن', 'ایجاد', 'create', 'make', 'build', 'generate'],
        styles: ['مدرن', 'ساده', 'شیشه‌ای', 'کلاسیک', 'modern', 'simple', 'glass', 'classic'],
        colors: ['قرمز', 'آبی', 'سبز', 'زرد', 'بنفش', 'نارنجی', 'red', 'blue', 'green', 'yellow', 'purple', 'orange'],
        sizes: ['کوچک', 'متوسط', 'بزرگ', 'small', 'medium', 'large', 'big', 'tiny'],
        actions: ['hover', 'هاور', 'انیمیشن', 'animation', 'ripple', 'موج', 'افکت', 'effect']
      },

      // Header Creation Keywords  
      header: {
        fa: ['هدر', 'سرتیتر', 'بالا', 'عنوان', 'تیتر', 'سربرگ', 'منو', 'ناوبری', 'navigation'],
        en: ['header', 'top', 'title', 'nav', 'navigation', 'menu', 'navbar', 'hero'],
        context: ['سایت', 'صفحه', 'وب', 'website', 'page', 'web'],
        types: ['ساده', 'منو', 'hero', 'simple', 'nav', 'hero', 'mega'],
        elements: ['لوگو', 'logo', 'منو', 'menu', 'جستجو', 'search', 'کاربر', 'user']
      },

      // Card Creation Keywords
      card: {
        fa: ['کارت', 'باکس', 'جعبه', 'محتوا', 'بخش', 'قسمت'],
        en: ['card', 'box', 'container', 'section', 'panel', 'widget'],
        types: ['محصول', 'خدمات', 'تیم', 'نظرات', 'product', 'service', 'team', 'testimonial'],
        elements: ['تصویر', 'عکس', 'متن', 'دکمه', 'قیمت', 'image', 'photo', 'text', 'button', 'price']
      },

      // Form Creation Keywords
      form: {
        fa: ['فرم', 'ورودی', 'تماس', 'ثبت نام', 'عضویت', 'اطلاعات'],
        en: ['form', 'input', 'contact', 'register', 'signup', 'login', 'subscribe'],
        fields: ['نام', 'ایمیل', 'تلفن', 'پیام', 'رمز', 'name', 'email', 'phone', 'message', 'password'],
        types: ['تماس', 'ثبت نام', 'ورود', 'جستجو', 'contact', 'register', 'login', 'search']
      },

      // Page Creation Keywords
      page: {
        fa: ['صفحه', 'سایت', 'وب', 'landing', 'فرود'],
        en: ['page', 'website', 'site', 'landing', 'web'],
        types: ['فرود', 'داشبورد', 'پورتفولیو', 'بلاگ', 'فروشگاه', 'landing', 'dashboard', 'portfolio', 'blog', 'shop']
      },

      // Layout Keywords
      layout: {
        fa: ['چیدمان', 'لیست', 'شبکه', 'ستون', 'ردیف'],
        en: ['layout', 'grid', 'flex', 'column', 'row', 'list'],
        types: ['شبکه‌ای', 'عمودی', 'افقی', 'نوار کناری', 'grid', 'vertical', 'horizontal', 'sidebar']
      },

      // Code Generation Keywords
      code: {
        fa: ['کد', 'برنامه', 'اسکریپت', 'جاوا اسکریپت', 'سی اس اس'],
        en: ['code', 'script', 'javascript', 'js', 'css', 'html', 'function'],
        types: ['تابع', 'کلاس', 'انیمیشن', 'اعتبارسنجی', 'function', 'class', 'animation', 'validation']
      },

      // Memory Keywords
      memory: {
        fa: ['حافظه', 'ذخیره', 'یادآوری', 'فراموش', 'لیست', 'یادت میاد'],
        en: ['memory', 'save', 'remember', 'forget', 'recall', 'list'],
        actions: ['ذخیره کن', 'یادآوری', 'فراموش کن', 'لیست', 'save', 'remember', 'forget', 'list']
      },

      // AI Suggestion Keywords
      suggest: {
        fa: ['پیشنهاد', 'ایده', 'نظر', 'راهنما', 'کمک', 'چی بسازم'],
        en: ['suggest', 'idea', 'recommend', 'help', 'what', 'how'],
        context: ['بهترین', 'مناسب', 'خوب', 'best', 'suitable', 'good', 'perfect']
      }
    };
  }

  // Load user preferences for smart suggestions
  loadUserPreferences() {
    const prefsFile = path.join(this.memoryPath, 'user-preferences.json');
    if (fs.existsSync(prefsFile)) {
      try {
        return JSON.parse(fs.readFileSync(prefsFile, 'utf8'));
      } catch (error) {
        this.log(`خطا در خواندن ترجیحات: ${error.message}`, 'error');
      }
    }
    return {
      favoriteColors: ['#667eea', '#764ba2'],
      preferredStyle: 'modern',
      commonRequests: [],
      language: 'fa'
    };
  }

  // Save user preferences
  saveUserPreferences() {
    const prefsFile = path.join(this.memoryPath, 'user-preferences.json');
    try {
      fs.writeFileSync(prefsFile, JSON.stringify(this.userPreferences, null, 2), 'utf8');
    } catch (error) {
      this.log(`خطا در ذخیره ترجیحات: ${error.message}`, 'error');
    }
  }

  // Smart Intent Detection - Core Intelligence
  detectIntent(input) {
    const inputLower = input.toLowerCase();
    const words = inputLower.split(/[[.]s]+/);
    
    // Initialize scoring system
    const scores = {
      button: 0,
      header: 0,
      card: 0,
      form: 0,
      page: 0,
      layout: 0,
      code: 0,
      memory: 0,
      suggest: 0
    };

    // Analyze each word against keywords
    for (const word of words) {
      for (const [category, keywordSet] of Object.entries(this.keywords)) {
        // Check main keywords
        if (keywordSet.fa?.some(kw => word.includes(kw) || kw.includes(word))) {
          scores[category] += 3;
        }
        if (keywordSet.en?.some(kw => word.includes(kw) || kw.includes(word))) {
          scores[category] += 3;
        }
        
        // Check context keywords
        if (keywordSet.context?.some(kw => word.includes(kw) || kw.includes(word))) {
          scores[category] += 2;
        }
        
        // Check type-specific keywords
        ['types', 'styles', 'colors', 'sizes', 'actions', 'elements', 'fields'].forEach(subCategory => {
          if (keywordSet[subCategory]?.some(kw => word.includes(kw) || kw.includes(word))) {
            scores[category] += 1;
          }
        });
      }
    }

    // Context-based scoring adjustments
    if (inputLower.includes('بساز') || inputLower.includes('ایجاد') || inputLower.includes('درست کن') || 
        inputLower.includes('create') || inputLower.includes('make') || inputLower.includes('build')) {
      // Creation intent detected
      scores.button *= 1.5;
      scores.header *= 1.5;
      scores.card *= 1.5;
      scores.form *= 1.5;
      scores.page *= 1.5;
    }

    if (inputLower.includes('ذخیره') || inputLower.includes('یادت میاد') || inputLower.includes('فراموش')) {
      scores.memory *= 2;
    }

    if (inputLower.includes('پیشنهاد') || inputLower.includes('چی') || inputLower.includes('suggest')) {
      scores.suggest *= 2;
    }

    // Find the highest scoring category
    const topCategory = Object.entries(scores).reduce((max, current) => 
      current[1] > max[1] ? current : max
    );

    // Extract additional context
    const context = this.extractContext(inputLower, topCategory[0]);
    
    return {
      intent: topCategory[0],
      confidence: topCategory[1],
      context: context,
      allScores: scores
    };
  }

  // Extract detailed context from input
  extractContext(input, intent) {
    const context = {
      style: 'modern',
      colors: [],
      size: 'medium',
      type: 'simple',
      elements: [],
      customRequests: []
    };

    // Extract colors
    const colorKeywords = Object.values(this.keywords).flatMap(k => k.colors || []);
    colorKeywords.forEach(color => {
      if (input.includes(color)) {
        const colorMap = {
          'قرمز': '#e74c3c', 'red': '#e74c3c',
          'آبی': '#3498db', 'blue': '#3498db',
          'سبز': '#2ecc71', 'green': '#2ecc71',
          'زرد': '#f1c40f', 'yellow': '#f1c40f',
          'بنفش': '#9b59b6', 'purple': '#9b59b6',
          'نارنجی': '#e67e22', 'orange': '#e67e22'
        };
        if (colorMap[color]) {
          context.colors.push(colorMap[color]);
        }
      }
    });

    // Extract style
    const styleKeywords = ['مدرن', 'ساده', 'شیشه‌ای', 'کلاسیک', 'modern', 'simple', 'glass', 'classic'];
    for (const style of styleKeywords) {
      if (input.includes(style)) {
        const styleMap = {
          'مدرن': 'modern', 'modern': 'modern',
          'ساده': 'simple', 'simple': 'simple',
          'شیشه‌ای': 'glassmorphism', 'glass': 'glassmorphism',
          'کلاسیک': 'classic', 'classic': 'classic'
        };
        context.style = styleMap[style] || 'modern';
        break;
      }
    }

    // Extract size
    const sizeKeywords = ['کوچک', 'متوسط', 'بزرگ', 'small', 'medium', 'large'];
    for (const size of sizeKeywords) {
      if (input.includes(size)) {
        const sizeMap = {
          'کوچک': 'small', 'small': 'small',
          'متوسط': 'medium', 'medium': 'medium',
          'بزرگ': 'large', 'large': 'large'
        };
        context.size = sizeMap[size] || 'medium';
        break;
      }
    }

    // Intent-specific context extraction
    if (intent === 'button') {
      // Extract button text
      const buttonTextMatch = input.match(/(?:دکمه|button)[[[.]s]]*(?:با متن|with text)?[[[.]s]]*["']?([^"']+)["']?/);
      if (buttonTextMatch) {
        context.text = buttonTextMatch[1].trim();
      }
    }

    if (intent === 'header') {
      // Extract header title
      const titleMatch = input.match(/(?:هدر|header)[[[.]s]]*(?:با عنوان|with title)?[[[.]s]]*["']?([^"']+)["']?/);
      if (titleMatch) {
        context.title = titleMatch[1].trim();
      }
    }

    return context;
  }

  // Update user preferences based on usage
  updateUserPreferences(intent, context) {
    // Track common requests
    const request = { intent, context, timestamp: Date.now() };
    this.userPreferences.commonRequests = this.userPreferences.commonRequests || [];
    this.userPreferences.commonRequests.push(request);
    
    // Keep only recent requests (last 50)
    if (this.userPreferences.commonRequests.length > 50) {
      this.userPreferences.commonRequests = this.userPreferences.commonRequests.slice(-50);
    }

    // Update favorite colors
    if (context.colors && context.colors.length > 0) {
      this.userPreferences.favoriteColors = this.userPreferences.favoriteColors || [];
      context.colors.forEach(color => {
        if (!this.userPreferences.favoriteColors.includes(color)) {
          this.userPreferences.favoriteColors.push(color);
        }
      });
      
      // Keep top 10 colors
      if (this.userPreferences.favoriteColors.length > 10) {
        this.userPreferences.favoriteColors = this.userPreferences.favoriteColors.slice(-10);
      }
    }

    // Update preferred style
    if (context.style && context.style !== 'modern') {
      this.userPreferences.preferredStyle = context.style;
    }

    this.saveUserPreferences();
  }

  ensureDirectories() {
    const dirs = [this.memoryPath, this.outputPath, this.templatesPath];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${message}`);
  }

  setupToolHandlers() {
    // Streamlined tool list with smart descriptions
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'smart_create',
            description: 'ساخت هوشمند با تشخیص خودکار نوع المان | Smart creation with automatic element detection[.]Keywords: دکمه/button, هدر/header, کارت/card, فرم/form, صفحه/page, چیدمان/layout',
            inputSchema: {
              type: 'object',
              properties: {
                request: { 
                  type: 'string', 
                  description: 'درخواست به زبان طبیعی | Natural language request (Persian/English)'
                }
              },
              required: ['request']
            }
          },
          
          {
            name: 'smart_memory',
            description: 'مدیریت هوشمند حافظه | Smart memory management[.]Keywords: ذخیره/save, یادآوری/remember, فراموش/forget, لیست/list',
            inputSchema: {
              type: 'object',
              properties: {
                request: { 
                  type: 'string', 
                  description: 'درخواست حافظه به زبان طبیعی | Natural memory request'
                }
              },
              required: ['request']
            }
          },
          
          {
            name: 'smart_suggest',
            description: 'پیشنهاد هوشمند بر اساس نیاز | Smart suggestions based on needs[.]Keywords: پیشنهاد/suggest, ایده/idea, کمک/help, چی بسازم/what to create',
            inputSchema: {
              type: 'object',
              properties: {
                request: { 
                  type: 'string', 
                  description: 'درخواست پیشنهاد | Suggestion request'
                }
              },
              required: ['request']
            }
          },
          
          {
            name: 'smart_code',
            description: 'تولید کد هوشمند | Smart code generation[.]Keywords: کد/code, جاوا اسکریپت/javascript, سی اس اس/css, تابع/function',
            inputSchema: {
              type: 'object',
              properties: {
                request: { 
                  type: 'string', 
                  description: 'درخواست تولید کد | Code generation request'
                }
              },
              required: ['request']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        this.log(`🎯 تشخیص درخواست: ${args.request}`);
        
        // Smart intent detection
        const analysis = this.detectIntent(args.request);
        this.log(`🧠 تشخیص هوش: ${analysis.intent} (اعتماد: ${analysis.confidence})`);
        
        // Update user preferences
        this.updateUserPreferences(analysis.intent, analysis.context);
        
        // Route to appropriate handler based on detected intent
        switch (name) {
          case 'smart_create':
            return await this.handleSmartCreate(args.request, analysis);
          
          case 'smart_memory':
            return await this.handleSmartMemory(args.request, analysis);
          
          case 'smart_suggest':
            return await this.handleSmartSuggest(args.request, analysis);
          
          case 'smart_code':
            return await this.handleSmartCode(args.request, analysis);
          
          default:
            // Fallback: auto-detect and route
            return await this.handleAutoRoute(args.request, analysis);
        }
      } catch (error) {
        this.log(`❌ خطا: ${error.message}`, 'error');
        throw new McpError(ErrorCode.InternalError, `خطا: ${error.message}`);
      }
    });
  }

  // Smart Create Handler
  async handleSmartCreate(request, analysis) {
    const { intent, context } = analysis;
    
    // Apply user preferences if not specified
    if (!context.colors.length && this.userPreferences.favoriteColors.length) {
      context.colors = [this.userPreferences.favoriteColors[0]];
    }
    
    if (context.style === 'modern' && this.userPreferences.preferredStyle !== 'modern') {
      context.style = this.userPreferences.preferredStyle;
    }

    let result;
    
    switch (intent) {
      case 'button':
        result = await this.createSmartButton(context, request);
        break;
      case 'header':
        result = await this.createSmartHeader(context, request);
        break;
      case 'card':
        result = await this.createSmartCard(context, request);
        break;
      case 'form':
        result = await this.createSmartForm(context, request);
        break;
      case 'page':
        result = await this.createSmartPage(context, request);
        break;
      case 'layout':
        result = await this.createSmartLayout(context, request);
        break;
      default:
        result = await this.createGenericElement(context, request);
    }

    return {
      content: [{
        type: 'text',
        text: `🎯 تشخیص هوشمند: ${intent}[.]` +
              `🎨 سبک اعمال شده: ${context.style}[.]` +
              `🎨 رنگ‌ها: ${context.colors.join(', ') || 'پیش‌فرض'}[.][.]` +
              result.message + '[.][.]' +
              `💡 بر اساس ترجیحات شما شخصی‌سازی شد![.]` +
              `📊 اعتماد تشخیص: ${Math.round(analysis.confidence * 10)}%`
      }]
    };
  }

  // Smart Memory Handler
  async handleSmartMemory(request, analysis) {
    const requestLower = request.toLowerCase();
    
    if (requestLower.includes('ذخیره') || requestLower.includes('save')) {
      return await this.handleMemorySave(request);
    } else if (requestLower.includes('یادت میاد') || requestLower.includes('recall') || requestLower.includes('remember')) {
      return await this.handleMemoryRecall(request);
    } else if (requestLower.includes('لیست') || requestLower.includes('list')) {
      return await this.handleMemoryList();
    } else if (requestLower.includes('فراموش') || requestLower.includes('forget')) {
      return await this.handleMemoryForget(request);
    }
    
    return {
      content: [{
        type: 'text',
        text: `🧠 عملیات حافظه شناسایی نشد.[.][.]` +
              `دستورات قابل قبول:[.]` +
              `• "ذخیره کن [محتوا]" - برای ذخیره[.]` +
              `• "یادت میاد [چیزی]؟" - برای جستجو[.]` +
              `• "لیست حافظه" - برای نمایش همه[.]` +
              `• "فراموش کن [چیزی]" - برای حذف`
      }]
    };
  }

  // Smart Suggest Handler
  async handleSmartSuggest(request, analysis) {
    const suggestions = this.generateIntelligentSuggestions(request, analysis);
    
    return {
      content: [{
        type: 'text',
        text: `🤖 پیشنهادات هوشمند بر اساس "${request}":[.][.]` +
              suggestions.map((suggestion, i) => 
                `${i + 1}. **${suggestion.title}**[.]` +
                `   📝 ${suggestion.description}[.]` +
                `   🎨 سبک: ${suggestion.style}[.]` +
                `   ⚡ سرعت ساخت: ${suggestion.speed}[.]` +
                `   💡 ${suggestion.tip}[.]`
              ).join('[.]') +
              `[.]🎯 بر اساس ${this.userPreferences.commonRequests.length} درخواست قبلی شما شخصی‌سازی شد.`
      }]
    };
  }

  // Smart Code Handler
  async handleSmartCode(request, analysis) {
    const codeResult = this.generateSmartCode(request, analysis);
    
    const timestamp = Date.now();
    const fileName = `smart-code-${timestamp}.${codeResult.extension}`;
    const filePath = path.join(this.outputPath, fileName);
    
    fs.writeFileSync(filePath, codeResult.code, 'utf8');
    
    return {
      content: [{
        type: 'text',
        text: `💻 کد هوشمند تولید شد![.][.]` +
              `📁 فایل: ${fileName}[.]` +
              `🔧 زبان: ${codeResult.language}[.]` +
              `⚡ قابلیت: ${codeResult.functionality}[.][.]` +
              `**نمونه کد:**[.][.][.][.]${codeResult.language}[.]${codeResult.code.substring(0, 300)}...[.][.][.][.]`
      }]
    };
  }

  // Auto-route handler for fallback
  async handleAutoRoute(request, analysis) {
    const { intent } = analysis;
    
    switch (intent) {
      case 'memory':
        return await this.handleSmartMemory(request, analysis);
      case 'suggest':
        return await this.handleSmartSuggest(request, analysis);
      case 'code':
        return await this.handleSmartCode(request, analysis);
      default:
        return await this.handleSmartCreate(request, analysis);
    }
  }

  // Create Smart Button
  async createSmartButton(context, request) {
    const buttonText = context.text || this.extractText(request) || 'دکمه هوشمند';
    const color = context.colors[0] || this.userPreferences.favoriteColors[0] || '#667eea';
    const size = context.size || 'medium';
    const style = context.style || this.userPreferences.preferredStyle || 'modern';

    const timestamp = Date.now();
    const fileName = `smart-button-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const html = this.generateButtonHTML(buttonText, color, size, style);
    fs.writeFileSync(filePath, html, 'utf8');

    return {
      message: `✅ دکمه هوشمند "${buttonText}" ساخته شد![.]📁 فایل: ${fileName}[.]🎨 رنگ: ${color}[.]📏 سایز: ${size}`
    };
  }

  // Create Smart Header
  async createSmartHeader(context, request) {
    const title = context.title || this.extractText(request) || 'هدر هوشمند';
    const style = context.style || this.userPreferences.preferredStyle || 'modern';

    const timestamp = Date.now();
    const fileName = `smart-header-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const html = this.generateHeaderHTML(title, style);
    fs.writeFileSync(filePath, html, 'utf8');

    return {
      message: `✅ هدر هوشمند "${title}" ساخته شد![.]📁 فایل: ${fileName}[.]🎨 سبک: ${style}`
    };
  }

  // Create Smart Card
  async createSmartCard(context, request) {
    const title = context.title || this.extractText(request) || 'کارت هوشمند';
    const style = context.style || this.userPreferences.preferredStyle || 'modern';

    const timestamp = Date.now();
    const fileName = `smart-card-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const html = this.generateCardHTML(title, style);
    fs.writeFileSync(filePath, html, 'utf8');

    return {
      message: `✅ کارت هوشمند "${title}" ساخته شد![.]📁 فایل: ${fileName}[.]🎨 سبک: ${style}`
    };
  }

  // Create Smart Form
  async createSmartForm(context, request) {
    const title = context.title || this.extractText(request) || 'فرم هوشمند';
    const style = context.style || this.userPreferences.preferredStyle || 'modern';

    const timestamp = Date.now();
    const fileName = `smart-form-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const html = this.generateFormHTML(title, style);
    fs.writeFileSync(filePath, html, 'utf8');

    return {
      message: `✅ فرم هوشمند "${title}" ساخته شد![.]📁 فایل: ${fileName}[.]🎨 سبک: ${style}`
    };
  }

  // Create Smart Page
  async createSmartPage(context, request) {
    const title = context.title || this.extractText(request) || 'صفحه هوشمند';
    const style = context.style || this.userPreferences.preferredStyle || 'modern';

    const timestamp = Date.now();
    const fileName = `smart-page-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const html = this.generatePageHTML(title, style);
    fs.writeFileSync(filePath, html, 'utf8');

    return {
      message: `✅ صفحه هوشمند "${title}" ساخته شد![.]📁 فایل: ${fileName}[.]🎨 سبک: ${style}`
    };
  }

  // Create Smart Layout
  async createSmartLayout(context, request) {
    const type = context.type || 'grid';
    const style = context.style || this.userPreferences.preferredStyle || 'modern';

    const timestamp = Date.now();
    const fileName = `smart-layout-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const html = this.generateLayoutHTML(type, style);
    fs.writeFileSync(filePath, html, 'utf8');

    return {
      message: `✅ چیدمان هوشمند "${type}" ساخته شد![.]📁 فایل: ${fileName}[.]🎨 سبک: ${style}`
    };
  }

  // Generate intelligent suggestions
  generateIntelligentSuggestions(request, analysis) {
    const suggestions = [];
    const { intent, context } = analysis;
    
    // Base suggestions on user's request history
    const commonRequests = this.userPreferences.commonRequests || [];
    const recentIntents = commonRequests.slice(-10).map(r => r.intent);
    
    if (intent === 'suggest' || analysis.confidence < 2) {
      // General suggestions based on user history
      if (recentIntents.includes('button')) {
        suggestions.push({
          title: 'دکمه تعاملی پیشرفته',
          description: 'دکمه با انیمیشن و افکت‌های زیبا بر اساس سلیقه شما',
          style: this.userPreferences.preferredStyle,
          speed: 'سریع',
          tip: 'بر اساس درخواست‌های قبلی شما پیشنهاد شده'
        });
      }
      
      if (recentIntents.includes('header')) {
        suggestions.push({
          title: 'هدر واکنشگرا',
          description: 'هدر مدرن با منوی ناوبری هوشمند',
          style: this.userPreferences.preferredStyle,
          speed: 'متوسط',
          tip: 'شامل بهینه‌سازی موبایل'
        });
      }
      
      // Add general suggestions
      suggestions.push({
        title: 'صفحه فرود کامل',
        description: 'صفحه حرفه‌ای با تمام المان‌های ضروری',
        style: 'modern',
        speed: 'کند',
        tip: 'بهترین گزینه برای شروع پروژه جدید'
      });
    } else {
      // Specific suggestions based on detected intent
      const intentSuggestions = {
        button: [
          { title: 'دکمه CTA قدرتمند', description: 'دکمه فراخوان عمل با تأثیر بصری بالا', style: 'modern', speed: 'سریع', tip: 'برای افزایش نرخ کلیک' },
          { title: 'دکمه شناور', description: 'دکمه معلق با انیمیشن', style: 'glassmorphism', speed: 'سریع', tip: 'جذاب و مدرن' }
        ],
        header: [
          { title: 'هدر Hero', description: 'هدر بزرگ با پس‌زمینه تصویری', style: 'hero', speed: 'متوسط', tip: 'برای صفحات فرود' },
          { title: 'نوار ناوبری چسبان', description: 'منوی ثابت در بالای صفحه', style: 'sticky', speed: 'سریع', tip: 'بهبود تجربه کاربری' }
        ],
        card: [
          { title: 'کارت محصول', description: 'کارت فروش با قیمت و دکمه خرید', style: 'product', speed: 'متوسط', tip: 'برای فروشگاه‌ها' },
          { title: 'کارت تیم', description: 'معرفی اعضای تیم با عکس', style: 'team', speed: 'سریع', tip: 'برای صفحه درباره ما' }
        ]
      };
      
      suggestions.push(...(intentSuggestions[intent] || []));
    }
    
    return suggestions.length > 0 ? suggestions : [{
      title: 'المان سفارشی',
      description: 'طراحی اختصاصی بر اساس نیاز شما',
      style: 'custom',
      speed: 'متغیر',
      tip: 'برای نیازهای خاص'
    }];
  }

  // Generate smart code
  generateSmartCode(request, analysis) {
    const requestLower = request.toLowerCase();
    
    if (requestLower.includes('تابع') || requestLower.includes('function')) {
      return {
        language: 'javascript',
        functionality: 'function',
        extension: 'js',
        code: this.generateJavaScriptFunction(request)
      };
    } else if (requestLower.includes('انیمیشن') || requestLower.includes('animation')) {
      return {
        language: 'css',
        functionality: 'animation',
        extension: 'css',
        code: this.generateCSSAnimation(request)
      };
    } else if (requestLower.includes('اعتبارسنجی') || requestLower.includes('validation')) {
      return {
        language: 'javascript',
        functionality: 'validation',
        extension: 'js',
        code: this.generateValidationCode(request)
      };
    }
    
    // Default: generate utility function
    return {
      language: 'javascript',
      functionality: 'utility',
      extension: 'js',
      code: this.generateUtilityCode(request)
    };
  }

  // Memory operations
  async handleMemorySave(request) {
    const content = this.extractContent(request);
    const category = this.detectCategory(request);
    
    const filePath = path.join(this.memoryPath, `${category}.json`);
    let data = [];
    
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    const newItem = {
      id: crypto.randomUUID(),
      content: content,
      timestamp: new Date().toISOString(),
      category: category
    };
    
    data.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return {
      content: [{
        type: 'text',
        text: `💾 ذخیره شد: "${content}"[.]🗂️ دسته: ${category}[.]🆔 شناسه: ${newItem.id.substring(0, 8)}`
      }]
    };
  }

  async handleMemoryRecall(request) {
    const query = this.extractQuery(request);
    const results = [];
    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const matches = data.filter(item => 
        item.content.toLowerCase().includes(query.toLowerCase())
      );
      
      results.push(...matches);
    }
    
    if (results.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `❌ چیزی با "${query}" پیدا نشد`
        }]
      };
    }
    
    const resultText = results.map(item => 
      `📝 ${item.category}: ${item.content}`
    ).join('[.]');
    
    return {
      content: [{
        type: 'text',
        text: `🔍 یافت شد:[.][.]${resultText}`
      }]
    };
  }

  async handleMemoryList() {
    const allItems = [];
    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      allItems.push(...data);
    }
    
    if (allItems.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `📭 حافظه خالی است`
        }]
      };
    }
    
    const grouped = allItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    
    let listText = '📚 محتویات حافظه:[.][.]';
    for (const [category, items] of Object.entries(grouped)) {
      listText += `🗂️ ${category}:[.]`;
      items.forEach(item => {
        listText += `  • ${item.content}[.]`;
      });
      listText += '[.]';
    }
    
    return {
      content: [{
        type: 'text',
        text: listText
      }]
    };
  }

  async handleMemoryForget(request) {
    const item = this.extractQuery(request);
    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    let found = false;
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const initialLength = data.length;
      
      data = data.filter(entry => 
        !entry.content.toLowerCase().includes(item.toLowerCase())
      );
      
      if (data.length < initialLength) {
        found = true;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: found ? `🗑️ فراموش شد: ${item}` : `❌ چیزی با "${item}" پیدا نشد`
      }]
    };
  }

  // Utility methods for text extraction
  extractText(input) {
    // Extract text after common keywords
    const patterns = [
      /(?:دکمه|button)[[[.]s]]*(?:با متن|with text)?[[[.]s]]*["']?([^"']+)["']?/i,
      /(?:هدر|header)[[[.]s]]*(?:با عنوان|with title)?[[[.]s]]*["']?([^"']+)["']?/i,
      /(?:کارت|card)[[[.]s]]*(?:با عنوان|with title)?[[[.]s]]*["']?([^"']+)["']?/i,
      /(?:فرم|form)[[[.]s]]*(?:با عنوان|with title)?[[[.]s]]*["']?([^"']+)["']?/i,
      /"([^"]+)"/,
      /'([^']+)'/
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  extractContent(input) {
    const match = input.match(/(?:ذخیره کن|save)[[[.]s]]+(.+)/i);
    return match ? match[1].trim() : input;
  }

  extractQuery(input) {
    const patterns = [
      /(?:یادت میاد|recall|remember)[[[.]s]]+(.+)/i,
      /(?:فراموش کن|forget)[[[.]s]]+(.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return input;
  }

  detectCategory(input) {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('پروژه') || inputLower.includes('project')) return 'projects';
    if (inputLower.includes('ایده') || inputLower.includes('idea')) return 'ideas';
    if (inputLower.includes('کار') || inputLower.includes('task')) return 'tasks';
    
    return 'notes';
  }

  // HTML Generators (simplified versions)
  generateButtonHTML(text, color, size, style) {
    const sizes = {
      small: 'padding: 8px 16px; font-size: 14px;',
      medium: 'padding: 12px 24px; font-size: 16px;',
      large: 'padding: 16px 32px; font-size: 18px;'
    };

    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>دکمه هوشمند</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 50px; background: #f5f6fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .smart-button { 
            background: linear-gradient(135deg, ${color}, ${this.darkenColor(color)});
            color: white; border: none; border-radius: 8px; ${sizes[size]}
            cursor: pointer; font-weight: 500; transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .smart-button:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <button class="smart-button">${text}</button>
</body>
</html>`;
  }

  generateHeaderHTML(title, style) {
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>هدر هوشمند</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
        .smart-header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px 0; text-align: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <header class="smart-header">
        <div class="container">
            <h1>${title}</h1>
        </div>
    </header>
</body>
</html>`;
  }

  generateCardHTML(title, style) {
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>کارت هوشمند</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 50px; background: #f5f6fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .smart-card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 400px; transition: transform 0.3s ease; }
        .smart-card:hover { transform: translateY(-5px); }
        h3 { font-size: 1.5rem; margin-bottom: 15px; color: #333; }
        p { color: #666; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="smart-card">
        <h3>${title}</h3>
        <p>این یک کارت هوشمند است که بر اساس درخواست شما ساخته شده است.</p>
    </div>
</body>
</html>`;
  }

  generateFormHTML(title, style) {
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فرم هوشمند</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 50px; background: linear-gradient(135deg, #667eea, #764ba2); min-height: 100vh; display: flex; justify-content: center; align-items: center; }
        .smart-form { background: rgba(255,255,255,0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; backdrop-filter: blur(10px); }
        h2 { text-align: center; margin-bottom: 30px; color: #333; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; }
        input, textarea { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; }
        button { width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 16px; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
    <form class="smart-form">
        <h2>${title}</h2>
        <div class="form-group">
            <label>نام:</label>
            <input type="text" required>
        </div>
        <div class="form-group">
            <label>ایمیل:</label>
            <input type="email" required>
        </div>
        <div class="form-group">
            <label>پیام:</label>
            <textarea rows="4" required></textarea>
        </div>
        <button type="submit">ارسال</button>
    </form>
</body>
</html>`;
  }

  generatePageHTML(title, style) {
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.6; }
        .hero { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 100px 0; text-align: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; opacity: 0.9; }
        .content { padding: 60px 0; background: #f8f9fa; text-align: center; }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>${title}</h1>
            <p>صفحه هوشمند ساخته شده بر اساس درخواست شما</p>
        </div>
    </section>
    <section class="content">
        <div class="container">
            <h2>محتوای صفحه</h2>
            <p>این بخش می‌تواند شامل محتوای اصلی صفحه باشد.</p>
        </div>
    </section>
</body>
</html>`;
  }

  generateLayoutHTML(type, style) {
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>چیدمان هوشمند</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 50px; background: #f8f9fa; }
        .smart-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
        .layout-item { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h3 { margin-bottom: 10px; color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="smart-layout">
        <div class="layout-item">
            <h3>آیتم ۱</h3>
            <p>محتوای آیتم اول</p>
        </div>
        <div class="layout-item">
            <h3>آیتم ۲</h3>
            <p>محتوای آیتم دوم</p>
        </div>
        <div class="layout-item">
            <h3>آیتم ۳</h3>
            <p>محتوای آیتم سوم</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Code generators
  generateJavaScriptFunction(request) {
    return `// تابع هوشمند تولید شده
function smartFunction() {
    console.log('تابع هوشمند اجرا شد');
    
    // عملکرد اصلی
    const result = performTask();
    
    return result;
}

function performTask() {
    // پیاده‌سازی منطق اصلی
    return 'نتیجه موفقیت‌آمیز';
}

// استفاده از تابع
smartFunction();`;
  }

  generateCSSAnimation(request) {
    return `/* انیمیشن هوشمند */
@keyframes smartAnimation {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.animated-element {
    animation: smartAnimation 0.8s ease-out;
}

/* انیمیشن هاور */
.hover-effect:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
}`;
  }

  generateValidationCode(request) {
    return `// سیستم اعتبارسنجی هوشمند
class SmartValidator {
    constructor() {
        this.rules = {};
    }
    
    addRule(field, rule) {
        this.rules[field] = rule;
    }
    
    validate(data) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(this.rules)) {
            const value = data[field];
            
            if (rule.required && !value) {
                errors[field] = 'این فیلد الزامی است';
                continue;
            }
            
            if (rule.email && value && !this.isValidEmail(value)) {
                errors[field] = 'فرمت ایمیل صحیح نیست';
            }
            
            if (rule.minLength && value && value.length < rule.minLength) {
                errors[field] = [.]حداقل [.]{rule.minLength} کاراکتر وارد کنید[.];
            }
        }
        
        return Object.keys(errors).length === 0 ? null : errors;
    }
    
    isValidEmail(email) {
        return /^[^[[.]s]@]+@[^[[.]s]@]+[.][^[[.]s]@]+$/.test(email);
    }
}

// استفاده
const validator = new SmartValidator();
validator.addRule('email', { required: true, email: true });
validator.addRule('name', { required: true, minLength: 2 });`;
  }

  generateUtilityCode(request) {
    return `// کد کاربردی هوشمند
const SmartUtils = {
    // تأخیر هوشمند
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // تولید ID منحصر به فرد
    generateId: () => Math.random().toString(36).substring(2, 15),
    
    // فرمت‌دهی تاریخ فارسی
    formatPersianDate: (date) => {
        return new Intl.DateTimeFormat('fa-IR').format(date);
    },
    
    // اعتبارسنجی سریع
    validate: {
        email: (email) => /^[^[[.]s]@]+@[^[[.]s]@]+[.][^[[.]s]@]+$/.test(email),
        phone: (phone) => /^09[.]d{9}$/.test(phone),
        nationalId: (id) => {
            // الگوریتم اعتبارسنجی کد ملی
            if (!/^[.]d{10}$/.test(id)) return false;
            const digits = id.split('').map(Number);
            const checksum = digits.slice(0, 9).reduce((sum, digit, index) => 
                sum + digit * (10 - index), 0) % 11;
            return checksum < 2 ? checksum === digits[9] : 11 - checksum === digits[9];
        }
    }
};

// استفاده
console.log(SmartUtils.generateId());
console.log(SmartUtils.formatPersianDate(new Date()));`;
  }

  darkenColor(color) {
    // Simple color darkening
    return color.replace(/[0-9a-f]/g, (match) => {
      const val = parseInt(match, 16);
      return Math.max(0, val - 2).toString(16);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🧠 سرور MCP هوشمند با تشخیص کلمات کلیدی آماده - Token Optimized!');
  }
}

const server = new IntelligentPersianMCPServer();
server.run().catch(console.error);
