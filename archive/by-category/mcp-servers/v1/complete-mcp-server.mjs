#!/usr/bin/env node
/**
 * Complete MCP Server with Memory Management
 * Version: 7.0.0
 * - Full memory storage and retrieval
 * - Command execution capabilities
 * - Persian/English support
 * - RTL/LTR auto-detection
 */

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
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompleteMCPServer {
  constructor() {
    this.server = new Server(
      { name: 'complete-mcp-server', version: '7.0.0' },
      { capabilities: { tools: {} } }
    );

    // Memory and storage paths
    this.memoryPath = process.env.MEMORY_PATH || path.join(process.cwd(), 'cursor-memory');
    this.outputPath = process.env.OUTPUT_PATH || path.join(process.cwd(), 'cursor-outputs');
    this.memoryFile = path.join(this.memoryPath, 'mcp-memory.json');
    this.preferencesFile = path.join(this.memoryPath, 'mcp-preferences.json');
    this.commandsFile = path.join(this.memoryPath, 'mcp-commands.json');

    // In-memory cache for fast access
    this.memoryCache = new Map();
    this.preferencesCache = new Map();
    this.commandsCache = new Map();

    // Language detection
    this.languagePatterns = {
      persian: /[\u0600-\u06FF\u200C\u200D]/,
      english: /[A-Za-z]/,
    };

    this.ensureDirectories();
    this.loadMemory();
    this.setupToolHandlers();
    
    this.log('🧠 سرور MCP کامل آماده - حافظه و دستورات فعال!');
  }

  ensureDirectories() {
    [this.memoryPath, this.outputPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  detectLanguage(text = '') {
    if (!text) return 'english';
    return this.languagePatterns.persian.test(text) ? 'persian' : 'english';
  }

  // Memory Management
  loadMemory() {
    try {
      // Load main memory
      if (fs.existsSync(this.memoryFile)) {
        const data = JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
        this.memoryCache = new Map(Object.entries(data));
      }

      // Load preferences
      if (fs.existsSync(this.preferencesFile)) {
        const data = JSON.parse(fs.readFileSync(this.preferencesFile, 'utf8'));
        this.preferencesCache = new Map(Object.entries(data));
      }

      // Load commands
      if (fs.existsSync(this.commandsFile)) {
        const data = JSON.parse(fs.readFileSync(this.commandsFile, 'utf8'));
        this.commandsCache = new Map(Object.entries(data));
      }

      this.log(`حافظه بارگذاری شد: ${this.memoryCache.size} آیتم`);
    } catch (error) {
      this.log(`خطا در بارگذاری حافظه: ${error.message}`, 'error');
    }
  }

  saveMemory() {
    try {
      // Save main memory
      const memoryData = Object.fromEntries(this.memoryCache);
      fs.writeFileSync(this.memoryFile, JSON.stringify(memoryData, null, 2), 'utf8');

      // Save preferences
      const preferencesData = Object.fromEntries(this.preferencesCache);
      fs.writeFileSync(this.preferencesFile, JSON.stringify(preferencesData, null, 2), 'utf8');

      // Save commands
      const commandsData = Object.fromEntries(this.commandsCache);
      fs.writeFileSync(this.commandsFile, JSON.stringify(commandsData, null, 2), 'utf8');

      this.log('حافظه ذخیره شد');
    } catch (error) {
      this.log(`خطا در ذخیره حافظه: ${error.message}`, 'error');
    }
  }

  // Memory Operations
  storeInMemory(key, value, category = 'general', metadata = {}) {
    const memoryItem = {
      value,
      category,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        language: this.detectLanguage(JSON.stringify(value))
      },
      id: crypto.randomUUID()
    };

    this.memoryCache.set(key, memoryItem);
    this.saveMemory();

    const lang = this.detectLanguage(key);
    const message = lang === 'persian' 
      ? `✅ در حافظه ذخیره شد: ${key}`
      : `✅ Stored in memory: ${key}`;

    return {
      success: true,
      message,
      id: memoryItem.id,
      timestamp: memoryItem.metadata.timestamp
    };
  }

  retrieveFromMemory(key) {
    const item = this.memoryCache.get(key);
    if (!item) {
      const lang = this.detectLanguage(key);
      const message = lang === 'persian' 
        ? `❌ یافت نشد: ${key}`
        : `❌ Not found: ${key}`;
      return { success: false, message };
    }

    const lang = this.detectLanguage(key);
    const message = lang === 'persian' 
      ? `✅ از حافظه بازیابی شد: ${key}`
      : `✅ Retrieved from memory: ${key}`;

    return {
      success: true,
      message,
      data: item.value,
      metadata: item.metadata,
      id: item.id
    };
  }

  listMemory(category = null) {
    const items = Array.from(this.memoryCache.entries()).map(([key, item]) => ({
      key,
      category: item.category,
      timestamp: item.metadata.timestamp,
      language: item.metadata.language,
      id: item.id
    }));

    const filtered = category ? items.filter(item => item.category === category) : items;
    
    return {
      success: true,
      count: filtered.length,
      items: filtered,
      message: category 
        ? `📋 ${filtered.length} آیتم در دسته "${category}"`
        : `📋 ${filtered.length} آیتم در حافظه`
    };
  }

  deleteFromMemory(key) {
    if (!this.memoryCache.has(key)) {
      const lang = this.detectLanguage(key);
      const message = lang === 'persian' 
        ? `❌ یافت نشد: ${key}`
        : `❌ Not found: ${key}`;
      return { success: false, message };
    }

    this.memoryCache.delete(key);
    this.saveMemory();

    const lang = this.detectLanguage(key);
    const message = lang === 'persian' 
      ? `🗑️ حذف شد: ${key}`
      : `🗑️ Deleted: ${key}`;

    return { success: true, message };
  }

  // Command Execution
  executeCommand(command, parameters = {}) {
    try {
      const commandId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      // Store command in cache
      this.commandsCache.set(commandId, {
        command,
        parameters,
        timestamp,
        status: 'executed'
      });

      // Execute based on command type
      let result;
      switch (command) {
        case 'create_button':
          result = this.createButton(parameters);
          break;
        case 'create_card':
          result = this.createCard(parameters);
          break;
        case 'create_form':
          result = this.createForm(parameters);
          break;
        case 'generate_page':
          result = this.generatePage(parameters);
          break;
        case 'save_preference':
          result = this.savePreference(parameters);
          break;
        case 'get_analytics':
          result = this.getAnalytics(parameters);
          break;
        default:
          result = { success: false, message: `دستور ناشناخته: ${command}` };
      }

      // Update command status
      this.commandsCache.set(commandId, {
        ...this.commandsCache.get(commandId),
        result,
        status: 'completed'
      });

      this.saveMemory();

      return {
        success: true,
        commandId,
        result,
        message: `دستور اجرا شد: ${command}`
      };

    } catch (error) {
      this.log(`خطا در اجرای دستور: ${error.message}`, 'error');
      return {
        success: false,
        message: `خطا در اجرای دستور: ${error.message}`
      };
    }
  }

  // Component Creators
  createButton(params) {
    const { text = 'دکمه', color = '#667eea', size = 'medium', style = 'modern' } = params;
    const timestamp = Date.now();
    const fileName = `button-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${text}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; padding: 50px; background: #f5f7fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .btn { background: linear-gradient(135deg, ${color}, ${this.darkenColor(color)}); color: white; border: none; border-radius: 8px; padding: ${this.getSizePadding(size)}; font-size: ${this.getSizeFont(size)}; cursor: pointer; font-weight: 500; transition: all 0.3s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <button class="btn">${text}</button>
</body>
</html>`;

    fs.writeFileSync(filePath, html, 'utf8');
    return { success: true, file: fileName, path: filePath, message: `دکمه "${text}" ساخته شد` };
  }

  createCard(params) {
    const { title = 'کارت', content = 'محتوا', color = '#667eea' } = params;
    const timestamp = Date.now();
    const fileName = `card-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; padding: 50px; background: #f8f9fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 400px; transition: all 0.3s ease; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .card-title { font-size: 1.5rem; font-weight: bold; color: #333; margin-bottom: 15px; }
        .card-content { color: #666; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="card">
        <h3 class="card-title">${title}</h3>
        <p class="card-content">${content}</p>
    </div>
</body>
</html>`;

    fs.writeFileSync(filePath, html, 'utf8');
    return { success: true, file: fileName, path: filePath, message: `کارت "${title}" ساخته شد` };
  }

  createForm(params) {
    const { title = 'فرم تماس', fields = [] } = params;
    const timestamp = Date.now();
    const fileName = `form-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const defaultFields = [
      { name: 'name', label: 'نام', type: 'text', required: true },
      { name: 'email', label: 'ایمیل', type: 'email', required: true },
      { name: 'message', label: 'پیام', type: 'textarea', required: true }
    ];

    const formFields = (fields.length > 0 ? fields : defaultFields).map(field => {
      if (field.type === 'textarea') {
        return `<div class="form-group">
          <label>${field.label}${field.required ? ' *' : ''}</label>
          <textarea name="${field.name}" rows="4" ${field.required ? 'required' : ''}></textarea>
        </div>`;
      }
      return `<div class="form-group">
        <label>${field.label}${field.required ? ' *' : ''}</label>
        <input type="${field.type}" name="${field.name}" ${field.required ? 'required' : ''}>
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; }
        .form-container { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .form-title { text-align: center; font-size: 2rem; font-weight: bold; color: #333; margin-bottom: 30px; }
        .form-group { margin-bottom: 25px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; transition: all 0.3s ease; font-family: inherit; }
        .form-group input:focus, .form-group textarea:focus { border-color: #667eea; outline: none; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .submit-btn { width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 16px; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <div class="form-container">
        <h2 class="form-title">${title}</h2>
        <form>${formFields}<button type="submit" class="submit-btn">ارسال</button></form>
    </div>
</body>
</html>`;

    fs.writeFileSync(filePath, html, 'utf8');
    return { success: true, file: fileName, path: filePath, message: `فرم "${title}" ساخته شد` };
  }

  generatePage(params) {
    const { title = 'صفحه جدید', sections = [] } = params;
    const timestamp = Date.now();
    const fileName = `page-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const defaultSections = [
      { type: 'hero', title: title, subtitle: 'به وب‌سایت ما خوش آمدید' },
      { type: 'content', title: 'درباره ما', content: 'محتوای نمونه' }
    ];

    const pageSections = (sections.length > 0 ? sections : defaultSections).map(section => {
      if (section.type === 'hero') {
        return `<section class="hero-section">
          <div class="container">
            <h1>${section.title}</h1>
            <p>${section.subtitle || ''}</p>
          </div>
        </section>`;
      }
      return `<section class="content-section">
        <div class="container">
          <h2>${section.title}</h2>
          <p>${section.content || ''}</p>
        </div>
      </section>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero-section { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 100px 0; text-align: center; }
        .hero-section h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero-section p { font-size: 1.2rem; opacity: 0.9; }
        .content-section { padding: 80px 0; background: #f8f9fa; }
        .content-section h2 { font-size: 2.5rem; margin-bottom: 1rem; text-align: center; }
        .content-section p { font-size: 1.1rem; text-align: center; max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    ${pageSections}
</body>
</html>`;

    fs.writeFileSync(filePath, html, 'utf8');
    return { success: true, file: fileName, path: filePath, message: `صفحه "${title}" ساخته شد` };
  }

  savePreference(params) {
    const { key, value, category = 'general' } = params;
    this.preferencesCache.set(key, { value, category, timestamp: new Date().toISOString() });
    this.saveMemory();
    return { success: true, message: `ترجیح "${key}" ذخیره شد` };
  }

  getAnalytics(params) {
    const { period = 'all' } = params;
    const stats = {
      memoryItems: this.memoryCache.size,
      preferences: this.preferencesCache.size,
      commands: this.commandsCache.size,
      period,
      timestamp: new Date().toISOString()
    };
    return { success: true, data: stats, message: 'آمار سیستم' };
  }

  // Helper methods
  getSizePadding(size) {
    return size === 'large' ? '16px 32px' : size === 'small' ? '8px 16px' : '12px 24px';
  }

  getSizeFont(size) {
    return size === 'large' ? '18px' : size === 'small' ? '14px' : '16px';
  }

  darkenColor(color) {
    return color.replace(/[0-9a-f]/g, (match) => {
      const val = parseInt(match, 16);
      return Math.max(0, val - 2).toString(16);
    });
  }

  // Tool Handlers
  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'store_memory',
          description: 'ذخیره اطلاعات در حافظه MCP',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'کلید ذخیره‌سازی' },
              value: { type: 'object', description: 'مقدار برای ذخیره' },
              category: { type: 'string', description: 'دسته‌بندی (اختیاری)', default: 'general' },
              metadata: { type: 'object', description: 'اطلاعات اضافی (اختیاری)' }
            },
            required: ['key', 'value']
          }
        },
        {
          name: 'retrieve_memory',
          description: 'بازیابی اطلاعات از حافظه MCP',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'کلید برای بازیابی' }
            },
            required: ['key']
          }
        },
        {
          name: 'list_memory',
          description: 'لیست تمام اطلاعات حافظه',
          inputSchema: {
            type: 'object',
            properties: {
              category: { type: 'string', description: 'فیلتر بر اساس دسته (اختیاری)' }
            }
          }
        },
        {
          name: 'delete_memory',
          description: 'حذف اطلاعات از حافظه',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'کلید برای حذف' }
            },
            required: ['key']
          }
        },
        {
          name: 'execute_command',
          description: 'اجرای دستور در سرور MCP',
          inputSchema: {
            type: 'object',
            properties: {
              command: { type: 'string', description: 'نام دستور' },
              parameters: { type: 'object', description: 'پارامترهای دستور' }
            },
            required: ['command']
          }
        },
        {
          name: 'create_component',
          description: 'ساخت کامپوننت وب (دکمه، کارت، فرم، صفحه)',
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['button', 'card', 'form', 'page'], description: 'نوع کامپوننت' },
              parameters: { type: 'object', description: 'پارامترهای کامپوننت' }
            },
            required: ['type', 'parameters']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const t0 = Date.now();

      try {
        let result;
        switch (name) {
          case 'store_memory':
            result = this.storeInMemory(args.key, args.value, args.category, args.metadata);
            break;
          case 'retrieve_memory':
            result = this.retrieveFromMemory(args.key);
            break;
          case 'list_memory':
            result = this.listMemory(args.category);
            break;
          case 'delete_memory':
            result = this.deleteFromMemory(args.key);
            break;
          case 'execute_command':
            result = this.executeCommand(args.command, args.parameters);
            break;
          case 'create_component':
            result = this.executeCommand(`create_${args.type}`, args.parameters);
            break;
          default:
            throw new McpError(ErrorCode.MethodNotFound, `ابزار ناشناخته: ${name}`);
        }

        this.log(`✅ ${name} اجرا شد (${Date.now() - t0}ms)`);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };

      } catch (error) {
        this.log(`❌ خطا در ${name}: ${error.message}`, 'error');
        throw new McpError(ErrorCode.InternalError, `خطا: ${error.message}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.log('🚀 سرور MCP کامل متصل شد - حافظه و دستورات فعال!');
  }
}

const server = new CompleteMCPServer();
server.run().catch(console.error);
