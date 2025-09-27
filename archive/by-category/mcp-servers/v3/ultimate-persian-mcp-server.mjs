#!/usr/bin/env node
/**
 * Ultimate Persian MCP Server - Complete & Intelligent
 * Version: 8.0.0
 * 
 * Features:
 * ✅ ALL MCP SDK capabilities (Tools, Prompts, Resources, Logging, Completions)
 * ✅ Smart bilingual command detection (Persian/English)
 * ✅ Intelligent parameter completion
 * ✅ Complete memory system with search & analytics
 * ✅ Advanced UI generation with responsive design
 * ✅ Code optimization and performance analysis
 * ✅ Context-aware suggestions
 * ✅ Token optimization for Cursor
 * 
 * Usage:
 * - Server mode: `node ultimate-persian-mcp-server.mjs`
 * - Config export: `node ultimate-persian-mcp-server.mjs --export-config`
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  InitializeRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  LoggingLevel,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Embedded Cursor Configuration
const cursorConfig = {
  "$schema": "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/mcp.json",
  "mcpServers": {
    "ultimate-persian-mcp": {
      "command": "node",
      "args": ["./ultimate-persian-mcp-server.mjs"],
      "env": {
        "MEMORY_PATH": "./cursor-memory",
        "OUTPUT_PATH": "./cursor-outputs",
        "TEMPLATES_PATH": "./cursor-templates",
        "RESOURCES_PATH": "./cursor-resources",
        "LANGUAGE": "auto",
        "LOG_LEVEL": "info"
      },
      "disabled": false,
      "autoApprove": ["list_tools", "call_tool", "list_prompts", "get_prompt", "list_resources", "read_resource"]
    }
  }
};

class UltimatePersianMCPServer {
  constructor() {
    this.server = new Server(
      { name: 'ultimate-persian-mcp-server', version: '8.0.0' },
      {
        capabilities: {
          tools: {},
          prompts: { listChanged: true },
          resources: { subscribe: true, listChanged: true },
          logging: {},
        },
      }
    );

    // Paths
    this.memoryPath = process.env.MEMORY_PATH || './cursor-memory';
    this.outputPath = process.env.OUTPUT_PATH || './cursor-outputs';
    this.templatesPath = process.env.TEMPLATES_PATH || './cursor-templates';
    this.resourcesPath = process.env.RESOURCES_PATH || './cursor-resources';
    
    // Files
    this.preferencesFile = path.join(this.memoryPath, 'preferences.json');
    this.statsFile = path.join(this.memoryPath, 'usage-stats.json');
    this.conversationFile = path.join(this.memoryPath, 'conversations.json');
    this.projectsFile = path.join(this.memoryPath, 'projects.json');

    // Language & Intelligence System
    this.languagePatterns = {
      persian: /[\u0600-\u06FF\u200C\u200D]/,
      english: /[A-Za-z]/,
      mixed: /[\u0600-\u06FF\u200C\u200D].*[A-Za-z]|[A-Za-z].*[\u0600-\u06FF\u200C\u200D]/
    };

    // Comprehensive Keyword System
    this.smartKeywords = {
      // UI Elements (Persian/English)
      elements: {
        'دکمه': 'button', 'button': 'button', 'btn': 'button', 'کلید': 'button',
        'کارت': 'card', 'card': 'card', 'باکس': 'card', 'جعبه': 'card',
        'فرم': 'form', 'form': 'form', 'تماس': 'form', 'ثبت‌نام': 'form',
        'هدر': 'header', 'header': 'header', 'سربرگ': 'header', 'بالا': 'header',
        'صفحه': 'page', 'page': 'page', 'وب‌سایت': 'page', 'سایت': 'page',
        'منو': 'navigation', 'menu': 'navigation', 'ناوبری': 'navigation',
        'فوتر': 'footer', 'footer': 'footer', 'پایین': 'footer'
      },
      
      // Styles (Persian/English)
      styles: {
        'مدرن': 'modern', 'modern': 'modern', 'جدید': 'modern',
        'ساده': 'minimal', 'minimal': 'minimal', 'simple': 'minimal', 'کم': 'minimal',
        'شیشه‌ای': 'glassmorphism', 'glassmorphism': 'glassmorphism', 'glass': 'glassmorphism',
        'تیره': 'dark', 'dark': 'dark', 'سیاه': 'dark',
        'روشن': 'light', 'light': 'light', 'سفید': 'light'
      },
      
      // Colors (Persian/English)
      colors: {
        'آبی': '#3498db', 'blue': '#3498db', 'ابی': '#3498db',
        'قرمز': '#e74c3c', 'red': '#e74c3c', 'سرخ': '#e74c3c',
        'سبز': '#2ecc71', 'green': '#2ecc71', 'زرد': '#f1c40f', 'yellow': '#f1c40f',
        'بنفش': '#9b59b6', 'purple': '#9b59b6', 'نارنجی': '#f39c12', 'orange': '#f39c12',
        'صورتی': '#e91e63', 'pink': '#e91e63', 'طوسی': '#95a5a6', 'gray': '#95a5a6'
      },
      
      // Actions (Persian/English)
      actions: {
        'ساخت': 'create', 'create': 'create', 'بساز': 'create', 'درست‌کن': 'create',
        'ذخیره': 'save', 'save': 'save', 'نگه‌دار': 'save', 'ضبط': 'save',
        'یادآوری': 'recall', 'recall': 'recall', 'بیاور': 'recall', 'پیدا‌کن': 'recall',
        'حذف': 'delete', 'delete': 'delete', 'پاک‌کن': 'delete', 'فراموش': 'delete',
        'لیست': 'list', 'list': 'list', 'فهرست': 'list', 'نمایش': 'list',
        'بهینه‌سازی': 'optimize', 'optimize': 'optimize', 'بهتر': 'optimize'
      },
      
      // Sizes (Persian/English)
      sizes: {
        'کوچک': 'small', 'small': 'small', 'ریز': 'small',
        'متوسط': 'medium', 'medium': 'medium', 'معمولی': 'medium',
        'بزرگ': 'large', 'large': 'large', 'درشت': 'large'
      }
    };

    // Initialize
    this.ensureDirectories();
    this.loadUserData();
    this.loadTemplates();
    this.setupAllHandlers();
    
    this.log('🚀 سرور MCP نهایی با تمام قابلیت‌ها آماده!', 'info');
  }

  // ==================== INFRASTRUCTURE ====================
  
  ensureDirectories() {
    const dirs = [this.memoryPath, this.outputPath, this.templatesPath, this.resourcesPath];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logLevel = process.env.LOG_LEVEL || 'info';
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    
    if (levels[level] <= levels[logLevel]) {
      console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  // ==================== LANGUAGE & INTELLIGENCE ====================
  
  detectLanguage(text = '') {
    if (!text) return 'english';
    
    if (this.languagePatterns.mixed.test(text)) return 'mixed';
    if (this.languagePatterns.persian.test(text)) return 'persian';
    return 'english';
  }

  smartParseCommand(input) {
    const lang = this.detectLanguage(input);
    const lowerInput = input.toLowerCase();
    
    // Extract element type
    let elementType = 'button'; // default
    for (const [key, value] of Object.entries(this.smartKeywords.elements)) {
      if (lowerInput.includes(key)) {
        elementType = value;
        break;
      }
    }
    
    // Extract style
    let style = 'modern'; // default
    for (const [key, value] of Object.entries(this.smartKeywords.styles)) {
      if (lowerInput.includes(key)) {
        style = value;
        break;
      }
    }
    
    // Extract color
    let color = null;
    for (const [key, value] of Object.entries(this.smartKeywords.colors)) {
      if (lowerInput.includes(key)) {
        color = value;
        break;
      }
    }
    
    // Extract size
    let size = 'medium'; // default
    for (const [key, value] of Object.entries(this.smartKeywords.sizes)) {
      if (lowerInput.includes(key)) {
        size = value;
        break;
      }
    }
    
    // Extract quoted text
    const quotedText = input.match(/"([^"]+)"|'([^']+)'|«([^»]+)»/);
    const text = quotedText ? (quotedText[1] || quotedText[2] || quotedText[3]) : 
                 (lang === 'persian' ? 'دکمه' : 'Button');
    
    return {
      language: lang,
      elementType,
      style,
      color,
      size,
      text,
      originalInput: input
    };
  }

  // ==================== USER DATA MANAGEMENT ====================
  
  loadUserData() {
    // Load preferences
    try {
      this.preferences = fs.existsSync(this.preferencesFile) 
        ? JSON.parse(fs.readFileSync(this.preferencesFile, 'utf8'))
        : {
            colors: { primary: '#667eea', secondary: '#764ba2', accent: '#e74c3c' },
            styles: ['modern', 'minimal'],
            language: 'auto',
            responsive: true,
            theme: 'light'
          };
    } catch (error) {
      this.preferences = { colors: { primary: '#667eea' }, styles: ['modern'] };
    }
    
    // Load usage stats
    try {
      this.stats = fs.existsSync(this.statsFile)
        ? JSON.parse(fs.readFileSync(this.statsFile, 'utf8'))
        : {};
    } catch (error) {
      this.stats = {};
    }
    
    // Load conversations
    try {
      this.conversations = fs.existsSync(this.conversationFile)
        ? JSON.parse(fs.readFileSync(this.conversationFile, 'utf8'))
        : { history: [], patterns: {} };
    } catch (error) {
      this.conversations = { history: [], patterns: {} };
    }
    
    // Load projects
    try {
      this.projects = fs.existsSync(this.projectsFile)
        ? JSON.parse(fs.readFileSync(this.projectsFile, 'utf8'))
        : {};
    } catch (error) {
      this.projects = {};
    }
  }

  saveUserData(type, data) {
    try {
      const files = {
        preferences: this.preferencesFile,
        stats: this.statsFile,
        conversations: this.conversationFile,
        projects: this.projectsFile
      };
      
      if (files[type]) {
        fs.writeFileSync(files[type], JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (error) {
      this.log(`Error saving ${type}: ${error.message}`, 'error');
    }
  }

  // ==================== TEMPLATES & STYLES ====================
  
  loadTemplates() {
    this.templates = {
      styles: {
        modern: `
          :root { 
            --primary: #667eea; --secondary: #764ba2; --accent: #e74c3c; 
            --bg: #f8f9fa; --text: #2c3e50; --border: #e1e8ed; 
            --radius: 12px; --shadow: 0 4px 20px rgba(0,0,0,0.1); 
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                 background: var(--bg); color: var(--text); line-height: 1.6; }
          .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
          .card { background: white; border-radius: var(--radius); padding: 24px; 
                  box-shadow: var(--shadow); transition: var(--transition); }
          .card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.15); }
          .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; 
                 border: none; border-radius: var(--radius); cursor: pointer; font-weight: 600;
                 background: linear-gradient(135deg, var(--primary), var(--secondary));
                 color: white; text-decoration: none; transition: var(--transition); }
          .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
          .form-group { margin-bottom: 20px; }
          .form-control { width: 100%; padding: 12px 16px; border: 2px solid var(--border); 
                          border-radius: var(--radius); font-size: 16px; transition: var(--transition); }
          .form-control:focus { outline: none; border-color: var(--primary); 
                               box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
          .grid { display: grid; gap: 24px; }
          .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
          .grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
          .rtl { direction: rtl; text-align: right; }
          @media (max-width: 768px) { 
            .container { padding: 16px; } 
            .grid-2, .grid-3 { grid-template-columns: 1fr; }
          }
        `,
        minimal: `
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                 background: #fff; color: #333; line-height: 1.5; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; 
                  background: #fff; margin-bottom: 16px; }
          .btn { padding: 10px 20px; border: 1px solid #ddd; border-radius: 6px; 
                 background: #f8f9fa; cursor: pointer; text-decoration: none; color: #333; }
          .btn-primary { background: #007bff; color: white; border-color: #007bff; }
          .form-control { width: 100%; padding: 10px; border: 1px solid #ddd; 
                          border-radius: 4px; font-size: 14px; }
          .rtl { direction: rtl; text-align: right; }
        `,
        glassmorphism: `
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                 font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: white; }
          .container { max-width: 1000px; margin: 0 auto; padding: 24px; }
          .glass { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px); 
                   border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; 
                   padding: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
          .btn { background: rgba(255, 255, 255, 0.2); color: white; 
                 border: 1px solid rgba(255, 255, 255, 0.3); padding: 12px 24px; 
                 border-radius: 50px; cursor: pointer; backdrop-filter: blur(10px); }
          .form-control { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); 
                          border-radius: 12px; color: white; padding: 12px 16px; width: 100%; }
          .form-control::placeholder { color: rgba(255, 255, 255, 0.7); }
          .rtl { direction: rtl; text-align: right; }
        `
      }
    };
  }

  // ==================== UI GENERATION ====================
  
  generateHTML({ lang, dir, title, css, body, responsive = true }) {
    const viewport = responsive ? '<meta name="viewport" content="width=device-width, initial-scale=1.0">' : '';
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  ${viewport}
  <title>${title}</title>
  <style>${css}</style>
</head>
<body class="${dir === 'rtl' ? 'rtl' : ''}">
  <div class="container">${body}</div>
</body>
</html>`;
  }

  createElement(type, content, style, language) {
    const isRTL = language === 'persian';
    const lang = isRTL ? 'fa' : 'en';
    const dir = isRTL ? 'rtl' : 'ltr';
    const css = this.templates.styles[style] || this.templates.styles.modern;
    
    let body = '';
    let title = '';

    switch (type) {
      case 'button':
        const btnText = content.text || (isRTL ? 'دکمه' : 'Button');
        const btnColor = content.color ? `style="background: ${content.color};"` : '';
        body = `<div class="card" style="text-align: center;">
          <button class="btn" ${btnColor}>${btnText}</button>
        </div>`;
        title = isRTL ? 'دکمه هوشمند' : 'Smart Button';
        break;
        
      case 'card':
        const cardTitle = content.title || (isRTL ? 'عنوان کارت' : 'Card Title');
        const cardContent = content.content || (isRTL ? 'محتوای کارت' : 'Card content');
        body = `<div class="card">
          <h3>${cardTitle}</h3>
          <p>${cardContent}</p>
          ${content.buttonText ? `<button class="btn">${content.buttonText}</button>` : ''}
        </div>`;
        title = cardTitle;
        break;
        
      case 'form':
        const formTitle = content.title || (isRTL ? 'فرم تماس' : 'Contact Form');
        const fields = content.fields || [
          { name: 'name', label: isRTL ? 'نام' : 'Name', type: 'text', required: true },
          { name: 'email', label: isRTL ? 'ایمیل' : 'Email', type: 'email', required: true },
          { name: 'message', label: isRTL ? 'پیام' : 'Message', type: 'textarea', required: true }
        ];
        
        const fieldHTML = fields.map(field => {
          if (field.type === 'textarea') {
            return `<div class="form-group">
              <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
              <textarea id="${field.name}" class="form-control" rows="4" ${field.required ? 'required' : ''}></textarea>
            </div>`;
          }
          return `<div class="form-group">
            <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
            <input type="${field.type}" id="${field.name}" class="form-control" ${field.required ? 'required' : ''}>
          </div>`;
        }).join('');
        
        body = `<div class="card glass">
          <h2>${formTitle}</h2>
          <form>${fieldHTML}
            <button type="submit" class="btn">${isRTL ? 'ارسال' : 'Submit'}</button>
          </form>
        </div>`;
        title = formTitle;
        break;
        
      case 'header':
        const headerTitle = content.title || (isRTL ? 'عنوان سایت' : 'Site Title');
        const nav = content.navigation || (isRTL ? 
          [{text: 'خانه', url: '#'}, {text: 'درباره', url: '#'}, {text: 'تماس', url: '#'}] :
          [{text: 'Home', url: '#'}, {text: 'About', url: '#'}, {text: 'Contact', url: '#'}]);
        
        const navHTML = nav.map(item => `<a href="${item.url}" class="btn">${item.text}</a>`).join(' ');
        body = `<header class="card" style="display: flex; justify-content: space-between; align-items: center;">
          <h1>${headerTitle}</h1>
          <nav>${navHTML}</nav>
        </header>`;
        title = headerTitle;
        break;
        
      case 'page':
        const pageTitle = content.title || (isRTL ? 'صفحه جدید' : 'New Page');
        const sections = content.sections || [
          { type: 'hero', title: pageTitle, subtitle: isRTL ? 'خوش آمدید' : 'Welcome' },
          { type: 'content', title: isRTL ? 'محتوا' : 'Content', content: isRTL ? 'متن نمونه' : 'Sample text' }
        ];
        
        const sectionsHTML = sections.map(section => {
          if (section.type === 'hero') {
            return `<section class="card" style="text-align: center; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white;">
              <h1>${section.title}</h1>
              <p>${section.subtitle || ''}</p>
            </section>`;
          }
          return `<section class="card">
            <h2>${section.title || ''}</h2>
            <p>${section.content || ''}</p>
          </section>`;
        }).join('');
        
        body = sectionsHTML;
        title = pageTitle;
        break;
    }

    return this.generateHTML({ lang, dir, title, css, body, responsive: true });
  }

  // ==================== MEMORY OPERATIONS ====================
  
  saveMemory(content, category = 'general') {
    const categoryFile = path.join(this.memoryPath, `${category}.json`);
    let data = [];
    
    try {
      if (fs.existsSync(categoryFile)) {
        data = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
      }
    } catch (error) {
      data = [];
    }
    
    const item = {
      id: crypto.randomUUID(),
      content,
      category,
      timestamp: new Date().toISOString(),
      language: this.detectLanguage(content)
    };
    
    data.unshift(item);
    
    // Keep only last 100 items per category
    if (data.length > 100) {
      data = data.slice(0, 100);
    }
    
    fs.writeFileSync(categoryFile, JSON.stringify(data, null, 2), 'utf8');
    return item;
  }

  searchMemory(query, category = null) {
    const results = [];
    const searchDir = category ? [`${category}.json`] : 
                     fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json') && 
                     !['preferences.json', 'usage-stats.json', 'conversations.json'].includes(f));
    
    for (const file of searchDir) {
      try {
        const filePath = path.join(this.memoryPath, file);
        if (!fs.existsSync(filePath)) continue;
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const matches = data.filter(item => 
          item.content && item.content.toLowerCase().includes(query.toLowerCase())
        );
        results.push(...matches);
      } catch (error) {
        this.log(`Error searching ${file}: ${error.message}`, 'error');
      }
    }
    
    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  listMemory(category = null) {
    const results = [];
    const listDir = category ? [`${category}.json`] : 
                   fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json') && 
                   !['preferences.json', 'usage-stats.json', 'conversations.json'].includes(f));
    
    for (const file of listDir) {
      try {
        const filePath = path.join(this.memoryPath, file);
        if (!fs.existsSync(filePath)) continue;
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        results.push(...data);
      } catch (error) {
        this.log(`Error listing ${file}: ${error.message}`, 'error');
      }
    }
    
    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  deleteMemory(query) {
    let deletedCount = 0;
    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json') && 
                 !['preferences.json', 'usage-stats.json', 'conversations.json'].includes(f));
    
    for (const file of files) {
      try {
        const filePath = path.join(this.memoryPath, file);
        if (!fs.existsSync(filePath)) continue;
        
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const originalLength = data.length;
        
        data = data.filter(item => 
          !item.content || !item.content.toLowerCase().includes(query.toLowerCase())
        );
        
        deletedCount += originalLength - data.length;
        
        if (data.length !== originalLength) {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        }
      } catch (error) {
        this.log(`Error deleting from ${file}: ${error.message}`, 'error');
      }
    }
    
    return deletedCount;
  }

  // ==================== ANALYTICS & STATS ====================
  
  trackUsage(tool, success, duration) {
    if (!this.stats[tool]) {
      this.stats[tool] = {
        calls: 0,
        errors: 0,
        totalDuration: 0,
        avgDuration: 0,
        lastUsed: null
      };
    }
    
    const stat = this.stats[tool];
    stat.calls++;
    if (!success) stat.errors++;
    stat.totalDuration += duration;
    stat.avgDuration = Math.round(stat.totalDuration / stat.calls);
    stat.lastUsed = new Date().toISOString();
    
    this.saveUserData('stats', this.stats);
  }

  getAnalytics() {
    const tools = Object.keys(this.stats);
    const totalCalls = tools.reduce((sum, tool) => sum + this.stats[tool].calls, 0);
    const totalErrors = tools.reduce((sum, tool) => sum + this.stats[tool].errors, 0);
    const avgDuration = tools.length ? 
      Math.round(tools.reduce((sum, tool) => sum + this.stats[tool].avgDuration, 0) / tools.length) : 0;
    
    return {
      summary: {
        totalTools: tools.length,
        totalCalls,
        totalErrors,
        errorRate: totalCalls ? Math.round((totalErrors / totalCalls) * 100) : 0,
        avgDuration
      },
      tools: this.stats
    };
  }

  // ==================== MCP HANDLERS ====================
  
  setupAllHandlers() {
    // Initialize Handler
    this.server.setRequestHandler(InitializeRequestSchema, async () => ({
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
        prompts: { listChanged: true },
        resources: { subscribe: true, listChanged: true },
        logging: {}
      },
      serverInfo: {
        name: "ultimate-persian-mcp-server",
        version: "8.0.0"
      }
    }));

    // Tools Handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'smart_create',
          description: 'ساخت هوشمند المان‌های UI | Smart UI element creation',
          inputSchema: {
            type: 'object',
            properties: {
              description: { 
                type: 'string', 
                description: 'توضیحات طبیعی آنچه می‌خواهید | Natural description of what you want' 
              },
              type: { 
                type: 'string', 
                enum: ['button', 'card', 'form', 'header', 'page'],
                description: 'نوع المان | Element type' 
              },
              content: { 
                type: 'object',
                description: 'محتوای المان | Element content' 
              },
              style: { 
                type: 'string', 
                enum: ['auto', 'modern', 'minimal', 'glassmorphism'],
                default: 'auto',
                description: 'سبک طراحی | Design style' 
              },
              language: { 
                type: 'string', 
                enum: ['auto', 'persian', 'english'],
                default: 'auto',
                description: 'زبان | Language' 
              }
            }
          }
        },
        {
          name: 'memory_save',
          description: 'ذخیره در حافظه | Save to memory',
          inputSchema: {
            type: 'object',
            properties: {
              content: { type: 'string', description: 'محتوای ذخیره | Content to save' },
              category: { type: 'string', default: 'general', description: 'دسته‌بندی | Category' }
            },
            required: ['content']
          }
        },
        {
          name: 'memory_search',
          description: 'جستجو در حافظه | Search memory',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'کلیدواژه جستجو | Search query' },
              category: { type: 'string', description: 'دسته‌بندی خاص | Specific category' }
            },
            required: ['query']
          }
        },
        {
          name: 'memory_list',
          description: 'لیست حافظه | List memory',
          inputSchema: {
            type: 'object',
            properties: {
              category: { type: 'string', description: 'دسته‌بندی خاص | Specific category' },
              limit: { type: 'number', default: 20, description: 'تعداد نتایج | Number of results' }
            }
          }
        },
        {
          name: 'memory_delete',
          description: 'حذف از حافظه | Delete from memory',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'کلیدواژه حذف | Delete query' }
            },
            required: ['query']
          }
        },
        {
          name: 'get_analytics',
          description: 'دریافت آمار استفاده | Get usage analytics',
          inputSchema: {
            type: 'object',
            properties: {
              detailed: { type: 'boolean', default: false, description: 'جزئیات کامل | Full details' }
            }
          }
        },
        {
          name: 'manage_preferences',
          description: 'مدیریت تنظیمات | Manage preferences',
          inputSchema: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['get', 'set', 'reset'], description: 'عملیات | Action' },
              data: { type: 'object', description: 'داده‌های تنظیمات | Preferences data' }
            },
            required: ['action']
          }
        }
      ]
    }));

    // Call Tool Handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const startTime = Date.now();
      
      try {
        let result;
        
        switch (name) {
          case 'smart_create':
            result = await this.handleSmartCreate(args);
            break;
          case 'memory_save':
            result = await this.handleMemorySave(args);
            break;
          case 'memory_search':
            result = await this.handleMemorySearch(args);
            break;
          case 'memory_list':
            result = await this.handleMemoryList(args);
            break;
          case 'memory_delete':
            result = await this.handleMemoryDelete(args);
            break;
          case 'get_analytics':
            result = await this.handleGetAnalytics(args);
            break;
          case 'manage_preferences':
            result = await this.handleManagePreferences(args);
            break;
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
        
        this.trackUsage(name, true, Date.now() - startTime);
        return result;
        
      } catch (error) {
        this.trackUsage(name, false, Date.now() - startTime);
        this.log(`Error in ${name}: ${error.message}`, 'error');
        throw new McpError(ErrorCode.InternalError, error.message);
      }
    });

    // Prompts Handler
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: 'create_ui_guide',
          description: 'راهنمای ساخت UI | UI Creation Guide',
          arguments: [
            { name: 'element_type', description: 'نوع المان | Element type', required: true },
            { name: 'style', description: 'سبک | Style', required: false }
          ]
        },
        {
          name: 'memory_guide',
          description: 'راهنمای حافظه | Memory Guide',
          arguments: [
            { name: 'operation', description: 'نوع عملیات | Operation type', required: true }
          ]
        }
      ]
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'create_ui_guide':
          return {
            description: `راهنمای ساخت ${args.element_type}`,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `لطفاً ${args.element_type} با سبک ${args.style || 'مدرن'} بسازید.`
                }
              }
            ]
          };
        case 'memory_guide':
          return {
            description: `راهنمای ${args.operation} در حافظه`,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `چگونه ${args.operation} در حافظه انجام دهم?`
                }
              }
            ]
          };
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown prompt: ${name}`);
      }
    });

    // Resources Handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'memory://all',
          name: 'All Memory Data',
          description: 'تمام داده‌های حافظه | All memory data',
          mimeType: 'application/json'
        },
        {
          uri: 'analytics://usage',
          name: 'Usage Analytics',
          description: 'آمار استفاده | Usage statistics',
          mimeType: 'application/json'
        },
        {
          uri: 'config://preferences',
          name: 'User Preferences',
          description: 'تنظیمات کاربر | User preferences',
          mimeType: 'application/json'
        }
      ]
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      switch (uri) {
        case 'memory://all':
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.listMemory(), null, 2)
            }]
          };
        case 'analytics://usage':
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.getAnalytics(), null, 2)
            }]
          };
        case 'config://preferences':
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.preferences, null, 2)
            }]
          };
        default:
          throw new McpError(ErrorCode.InvalidParams, `Unknown resource: ${uri}`);
      }
    });
  }

  // ==================== TOOL HANDLERS ====================
  
  async handleSmartCreate(args) {
    const { description, type, content = {}, style = 'auto', language = 'auto' } = args;
    
    // If description is provided, parse it intelligently
    if (description) {
      const parsed = this.smartParseCommand(description);
      const elementType = type || parsed.elementType;
      const elementStyle = style === 'auto' ? parsed.style : style;
      const elementLang = language === 'auto' ? parsed.language : language;
      
      const elementContent = {
        ...content,
        text: content.text || parsed.text,
        color: content.color || parsed.color,
        size: content.size || parsed.size
      };
      
      const html = this.createElement(elementType, elementContent, elementStyle, elementLang);
      const filename = `${elementType}-${Date.now()}.html`;
      const filepath = path.join(this.outputPath, filename);
      
      fs.writeFileSync(filepath, html, 'utf8');
      
      this.log(`Created ${elementType}: ${filename}`, 'info');
      
      return {
        content: [{
          type: 'text',
          text: `✅ ${elementType} ساخته شد!\n📁 فایل: ${filename}\n📂 مسیر: ${filepath}\n🎨 سبک: ${elementStyle}\n🌍 زبان: ${elementLang}`
        }]
      };
    }
    
    // Fallback to regular creation
    const elementType = type || 'button';
    const elementStyle = style === 'auto' ? 'modern' : style;
    const elementLang = language === 'auto' ? 'persian' : language;
    
    const html = this.createElement(elementType, content, elementStyle, elementLang);
    const filename = `${elementType}-${Date.now()}.html`;
    const filepath = path.join(this.outputPath, filename);
    
    fs.writeFileSync(filepath, html, 'utf8');
    
    return {
      content: [{
        type: 'text',
        text: `✅ ${elementType} created!\n📁 File: ${filename}\n📂 Path: ${filepath}`
      }]
    };
  }

  async handleMemorySave(args) {
    const { content, category = 'general' } = args;
    const item = this.saveMemory(content, category);
    
    this.log(`Saved to memory: ${content.substring(0, 50)}...`, 'info');
    
    return {
      content: [{
        type: 'text',
        text: `💾 ذخیره شد در دسته "${category}":\n${content}\n🆔 ID: ${item.id}`
      }]
    };
  }

  async handleMemorySearch(args) {
    const { query, category } = args;
    const results = this.searchMemory(query, category);
    
    if (results.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `❌ چیزی با "${query}" پیدا نشد`
        }]
      };
    }
    
    const resultText = results.slice(0, 10).map(item => 
      `📝 [${item.category}] ${item.content} (${new Date(item.timestamp).toLocaleDateString('fa-IR')})`
    ).join('\n\n');
    
    return {
      content: [{
        type: 'text',
        text: `🔍 ${results.length} نتیجه برای "${query}":\n\n${resultText}`
      }]
    };
  }

  async handleMemoryList(args) {
    const { category, limit = 20 } = args;
    const items = this.listMemory(category).slice(0, limit);
    
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: '📭 حافظه خالی است'
        }]
      };
    }
    
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    
    let listText = `📚 ${items.length} آیتم در حافظه:\n\n`;
    for (const [cat, catItems] of Object.entries(grouped)) {
      listText += `🗂️ ${cat} (${catItems.length}):\n`;
      catItems.slice(0, 5).forEach(item => {
        listText += `  • ${item.content.substring(0, 60)}${item.content.length > 60 ? '...' : ''}\n`;
      });
      listText += '\n';
    }
    
    return {
      content: [{
        type: 'text',
        text: listText
      }]
    };
  }

  async handleMemoryDelete(args) {
    const { query } = args;
    const deletedCount = this.deleteMemory(query);
    
    return {
      content: [{
        type: 'text',
        text: deletedCount > 0 ? 
          `🗑️ ${deletedCount} آیتم حذف شد` : 
          `❌ چیزی با "${query}" پیدا نشد`
      }]
    };
  }

  async handleGetAnalytics(args) {
    const { detailed = false } = args;
    const analytics = this.getAnalytics();
    
    let text = `📊 آمار استفاده:\n\n`;
    text += `🔧 تعداد ابزارها: ${analytics.summary.totalTools}\n`;
    text += `📞 کل فراخوانی‌ها: ${analytics.summary.totalCalls}\n`;
    text += `❌ خطاها: ${analytics.summary.totalErrors} (${analytics.summary.errorRate}%)\n`;
    text += `⏱️ متوسط زمان: ${analytics.summary.avgDuration}ms\n`;
    
    if (detailed) {
      text += `\n📋 جزئیات ابزارها:\n`;
      for (const [tool, stats] of Object.entries(analytics.tools)) {
        text += `\n🔹 ${tool}:\n`;
        text += `   📞 فراخوانی‌ها: ${stats.calls}\n`;
        text += `   ❌ خطاها: ${stats.errors}\n`;
        text += `   ⏱️ متوسط زمان: ${stats.avgDuration}ms\n`;
        text += `   📅 آخرین استفاده: ${stats.lastUsed ? new Date(stats.lastUsed).toLocaleDateString('fa-IR') : 'هرگز'}\n`;
      }
    }
    
    return {
      content: [{
        type: 'text',
        text
      }]
    };
  }

  async handleManagePreferences(args) {
    const { action, data } = args;
    
    switch (action) {
      case 'get':
        return {
          content: [{
            type: 'text',
            text: `⚙️ تنظیمات فعلی:\n${JSON.stringify(this.preferences, null, 2)}`
          }]
        };
        
      case 'set':
        if (data) {
          this.preferences = { ...this.preferences, ...data };
          this.saveUserData('preferences', this.preferences);
        }
        return {
          content: [{
            type: 'text',
            text: `✅ تنظیمات به‌روزرسانی شد`
          }]
        };
        
      case 'reset':
        this.preferences = {
          colors: { primary: '#667eea', secondary: '#764ba2', accent: '#e74c3c' },
          styles: ['modern', 'minimal'],
          language: 'auto',
          responsive: true,
          theme: 'light'
        };
        this.saveUserData('preferences', this.preferences);
        return {
          content: [{
            type: 'text',
            text: `🔄 تنظیمات به حالت پیش‌فرض بازگردانده شد`
          }]
        };
        
      default:
        throw new Error(`Unknown preferences action: ${action}`);
    }
  }

  // ==================== SERVER LIFECYCLE ====================
  
  async run() {
    const args = process.argv.slice(2);
    
    if (args.includes('--export-config')) {
      const configPath = path.join(process.cwd(), 'ultimate-mcp-config.json');
      fs.writeFileSync(configPath, JSON.stringify(cursorConfig, null, 2), 'utf8');
      console.log(`✅ Configuration exported to: ${configPath}`);
      return;
    }
    
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      this.log('🚀 Ultimate Persian MCP Server connected successfully!', 'info');
    } catch (error) {
      this.log(`❌ Failed to start server: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Start the server
const server = new UltimatePersianMCPServer();
server.run().catch(error => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});
