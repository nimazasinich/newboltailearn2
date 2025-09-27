#!/usr/bin/env node
/**
 * Enhanced Cursor MCP Server with Multiple Services
 * Version: 9.0.0
 * 
 * This server includes:
 * - Memory management
 * - Component creation
 * - Multiple service integrations (Canva, Dart, DigitalOcean, Figma, GitHub, JetBrains, MongoDB, React, Shopify, Vercel)
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

class EnhancedCursorMCPServer {
  constructor() {
    this.server = new Server(
      { 
        name: 'enhanced-cursor-mcp-server', 
        version: '9.0.0' 
      },
      { 
        capabilities: { 
          tools: {},
          resources: {},
          prompts: {}
        } 
      }
    );

    // Paths
    this.memoryPath = process.env.MEMORY_PATH || path.join(process.cwd(), 'cursor-memory');
    this.outputPath = process.env.OUTPUT_PATH || path.join(process.cwd(), 'cursor-outputs');
    this.memoryFile = path.join(this.memoryPath, 'cursor-memory.json');
    this.preferencesFile = path.join(this.memoryPath, 'cursor-preferences.json');
    this.commandsFile = path.join(this.memoryPath, 'cursor-commands.json');

    // In-memory cache
    this.memoryCache = new Map();
    this.preferencesCache = new Map();
    this.commandsCache = new Map();

    // Language detection
    this.languagePatterns = {
      persian: /[\u0600-\u06FF\u200C\u200D]/,
      english: /[A-Za-z]/,
    };

    // Service configurations
    this.services = {
      canva: {
        name: "canva",
        triggers: ["canva", "کانوا"],
        on_call: "🎨 کانوا در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "create-app",
            description: "ایجاد اپلیکیشن جدید در کانوا",
            endpoint: "/canva/create-app"
          },
          {
            name: "add-feature",
            description: "افزودن فیچر جدید به اپ",
            endpoint: "/canva/add-feature"
          },
          {
            name: "check-design",
            description: "بررسی راهنمای طراحی کانوا",
            endpoint: "/canva/check-design"
          }
        ]
      },
      dart: {
        name: "dart",
        triggers: ["dart", "دارت"],
        on_call: "🎯 دارت در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "list-projects",
            description: "لیست پروژه‌ها",
            endpoint: "/dart/list-projects"
          },
          {
            name: "manage-tasks",
            description: "مدیریت تسک‌ها",
            endpoint: "/dart/manage-tasks"
          },
          {
            name: "time-tracking",
            description: "پیگیری زمان",
            endpoint: "/dart/time-tracking"
          }
        ]
      },
      digitalocean: {
        name: "digitalocean",
        triggers: ["digitalocean", "دیجیتال اوشن"],
        on_call: "☁️ دیجیتال اوشن در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "list-apps",
            description: "لیست اپ‌ها",
            endpoint: "/digitalocean/list-apps"
          },
          {
            name: "deploy-from-github",
            description: "دیپلوی از گیت‌هاب",
            endpoint: "/digitalocean/deploy-from-github"
          },
          {
            name: "redeploy-app",
            description: "ری‌دیپلوی اپ",
            endpoint: "/digitalocean/redeploy-app"
          }
        ]
      },
      figma: {
        name: "figma",
        triggers: ["figma", "فیگما"],
        on_call: "🎨 فیگما در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "convert-frame",
            description: "تبدیل فریم یا نود به کد",
            endpoint: "/figma/convert-frame"
          },
          {
            name: "extract-layers",
            description: "استخراج لایه‌ها و متغیرهای طراحی",
            endpoint: "/figma/extract-layers"
          },
          {
            name: "check-components",
            description: "بررسی کامپوننت‌ها",
            endpoint: "/figma/check-components"
          }
        ]
      },
      github: {
        name: "github",
        triggers: ["github", "گیت‌هاپ"],
        on_call: "🐙 گیت‌هاپ در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "list-repos",
            description: "لیست مخزن‌ها",
            endpoint: "/github/list-repos"
          },
          {
            name: "read-file",
            description: "نمایش محتوای فایل",
            endpoint: "/github/read-file"
          },
          {
            name: "create-issue",
            description: "ایجاد Issue جدید",
            endpoint: "/github/create-issue"
          }
        ]
      },
      jetbrains: {
        name: "jetbrains",
        triggers: ["jetbrains", "جت‌برینز"],
        on_call: "💡 جت‌برینز در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "open-project",
            description: "باز کردن پروژه",
            endpoint: "/jetbrains/open-project"
          },
          {
            name: "refactor-code",
            description: "ریفکتور کد",
            endpoint: "/jetbrains/refactor-code"
          },
          {
            name: "generate-code",
            description: "ساخت کد",
            endpoint: "/jetbrains/generate-code"
          }
        ]
      },
      mongodb: {
        name: "mongodb",
        triggers: ["mongodb", "مانگودی‌بی"],
        on_call: "🗄 مانگودی‌بی در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "query-data",
            description: "جستجوی دیتا",
            endpoint: "/mongodb/query-data"
          },
          {
            name: "create-collection",
            description: "ایجاد کالکشن جدید",
            endpoint: "/mongodb/create-collection"
          },
          {
            name: "show-schema",
            description: "نمایش اسکیمای دیتابیس",
            endpoint: "/mongodb/show-schema"
          }
        ]
      },
      react: {
        name: "react",
        triggers: ["react", "ری‌اکت"],
        on_call: "⚛️ ری‌اکت در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "create-app",
            description: "ایجاد اپ React",
            endpoint: "/react/create-app"
          },
          {
            name: "run-server",
            description: "ران سرور توسعه",
            endpoint: "/react/run-server"
          },
          {
            name: "install-package",
            description: "نصب پکیج NPM",
            endpoint: "/react/install-package"
          }
        ]
      },
      shopify: {
        name: "shopify",
        triggers: ["shopify", "شاپیفای"],
        on_call: "🛍 شاپیفای در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "search-docs",
            description: "جستجوی مستندات Shopify",
            endpoint: "/shopify/search-docs"
          },
          {
            name: "create-function",
            description: "ایجاد فانکشن",
            endpoint: "/shopify/create-function"
          },
          {
            name: "show-apis",
            description: "بررسی APIها",
            endpoint: "/shopify/show-apis"
          }
        ]
      },
      vercel: {
        name: "vercel",
        triggers: ["vercel", "ورسل"],
        on_call: "▲ ورسل در خدمت شماست! من می‌تونم این کارها رو انجام بدم:",
        subcommands: [
          {
            name: "deploy-app",
            description: "دیپلوی اپ",
            endpoint: "/vercel/deploy-app"
          },
          {
            name: "show-settings",
            description: "نمایش تنظیمات اپ",
            endpoint: "/vercel/show-settings"
          },
          {
            name: "get-feedback",
            description: "دریافت بازخورد از اپ",
            endpoint: "/vercel/get-feedback"
          }
        ]
      }
    };

    this.ensureDirectories();
    this.loadMemory();
    this.setupToolHandlers();
    
    this.log('🚀 Enhanced Cursor MCP Server Ready - All Services Available!');
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

  // Memory Management (same as before)
  loadMemory() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const data = JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
        this.memoryCache = new Map(Object.entries(data));
      }
      if (fs.existsSync(this.preferencesFile)) {
        const data = JSON.parse(fs.readFileSync(this.preferencesFile, 'utf8'));
        this.preferencesCache = new Map(Object.entries(data));
      }
      if (fs.existsSync(this.commandsFile)) {
        const data = JSON.parse(fs.readFileSync(this.commandsFile, 'utf8'));
        this.commandsCache = new Map(Object.entries(data));
      }
      this.log(`Memory loaded: ${this.memoryCache.size} items`);
    } catch (error) {
      this.log(`Error loading memory: ${error.message}`, 'error');
    }
  }

  saveMemory() {
    try {
      const memoryData = Object.fromEntries(this.memoryCache);
      fs.writeFileSync(this.memoryFile, JSON.stringify(memoryData, null, 2), 'utf8');
      
      const preferencesData = Object.fromEntries(this.preferencesCache);
      fs.writeFileSync(this.preferencesFile, JSON.stringify(preferencesData, null, 2), 'utf8');
      
      const commandsData = Object.fromEntries(this.commandsCache);
      fs.writeFileSync(this.commandsFile, JSON.stringify(commandsData, null, 2), 'utf8');
      
      this.log('Memory saved successfully');
    } catch (error) {
      this.log(`Error saving memory: ${error.message}`, 'error');
    }
  }

  // Memory Operations (same as before)
  storeInMemory(key, value, category = 'general', metadata = {}) {
    const memoryItem = {
      value,
      category,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        language: this.detectLanguage(JSON.stringify(value)),
        id: crypto.randomUUID()
      }
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
      id: memoryItem.metadata.id,
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
      id: item.metadata.id
    };
  }

  listMemory(category = null) {
    const items = Array.from(this.memoryCache.entries()).map(([key, item]) => ({
      key,
      category: item.category,
      timestamp: item.metadata.timestamp,
      language: item.metadata.language,
      id: item.metadata.id
    }));

    const filtered = category ? items.filter(item => item.category === category) : items;
    
    return {
      success: true,
      count: filtered.length,
      items: filtered,
      message: category 
        ? `📋 ${filtered.length} items in category "${category}"`
        : `📋 ${filtered.length} items in memory`
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

  // Service Operations
  executeServiceCommand(serviceName, command, parameters = {}) {
    try {
      const service = this.services[serviceName];
      if (!service) {
        return {
          success: false,
          message: `Service not found: ${serviceName}`
        };
      }

      const subcommand = service.subcommands.find(cmd => cmd.name === command);
      if (!subcommand) {
        return {
          success: false,
          message: `Command not found: ${command} in service ${serviceName}`
        };
      }

      // Simulate service execution
      const result = {
        success: true,
        service: serviceName,
        command: command,
        endpoint: subcommand.endpoint,
        parameters: parameters,
        message: `Command ${command} executed for ${serviceName}`,
        timestamp: new Date().toISOString()
      };

      // Store command execution
      const commandId = crypto.randomUUID();
      this.commandsCache.set(commandId, {
        service: serviceName,
        command: command,
        parameters: parameters,
        result: result,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      this.saveMemory();

      return result;

    } catch (error) {
      this.log(`Error executing service command: ${error.message}`, 'error');
      return {
        success: false,
        message: `Error executing service command: ${error.message}`
      };
    }
  }

  listServices() {
    const serviceList = Object.values(this.services).map(service => ({
      name: service.name,
      triggers: service.triggers,
      on_call: service.on_call,
      subcommands: service.subcommands.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        endpoint: cmd.endpoint
      }))
    }));

    return {
      success: true,
      services: serviceList,
      count: serviceList.length,
      message: `Found ${serviceList.length} available services`
    };
  }

  getServiceInfo(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      return {
        success: false,
        message: `Service not found: ${serviceName}`
      };
    }

    return {
      success: true,
      service: {
        name: service.name,
        triggers: service.triggers,
        on_call: service.on_call,
        subcommands: service.subcommands
      },
      message: `Service info for ${serviceName}`
    };
  }

  // Component Creators (same as before)
  createButton(params) {
    const { text = 'Button', color = '#667eea', size = 'medium', style = 'modern' } = params;
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
        body { 
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
            margin: 0; 
            padding: 50px; 
            background: #f5f7fa; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
        }
        .btn { 
            background: linear-gradient(135deg, ${color}, ${this.darkenColor(color)}); 
            color: white; 
            border: none; 
            border-radius: 8px; 
            padding: ${this.getSizePadding(size)}; 
            font-size: ${this.getSizeFont(size)}; 
            cursor: pointer; 
            font-weight: 500; 
            transition: all 0.3s ease; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 5px 20px rgba(0,0,0,0.2); 
        }
    </style>
</head>
<body>
    <button class="btn">${text}</button>
</body>
</html>`;

    fs.writeFileSync(filePath, html, 'utf8');
    return { 
      success: true, 
      file: fileName, 
      path: filePath, 
      message: `Button "${text}" created successfully` 
    };
  }

  createCard(params) {
    const { title = 'Card', content = 'Content', color = '#667eea' } = params;
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
        body { 
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
            margin: 0; 
            padding: 50px; 
            background: #f8f9fa; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
        }
        .card { 
            background: white; 
            border-radius: 15px; 
            padding: 30px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            max-width: 400px; 
            transition: all 0.3s ease; 
        }
        .card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 20px 40px rgba(0,0,0,0.15); 
        }
        .card-title { 
            font-size: 1.5rem; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 15px; 
        }
        .card-content { 
            color: #666; 
            line-height: 1.6; 
        }
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
    return { 
      success: true, 
      file: fileName, 
      path: filePath, 
      message: `Card "${title}" created successfully` 
    };
  }

  createForm(params) {
    const { title = 'Contact Form', fields = [] } = params;
    const timestamp = Date.now();
    const fileName = `form-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const defaultFields = [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true }
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
        body { 
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
            margin: 0; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
        }
        .form-container { 
            background: rgba(255, 255, 255, 0.95); 
            backdrop-filter: blur(10px); 
            border-radius: 20px; 
            padding: 40px; 
            max-width: 500px; 
            width: 100%; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
        }
        .form-title { 
            text-align: center; 
            font-size: 2rem; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 30px; 
        }
        .form-group { 
            margin-bottom: 25px; 
        }
        .form-group label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: 500; 
            color: #333; 
        }
        .form-group input, .form-group textarea { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #e1e5e9; 
            border-radius: 8px; 
            font-size: 16px; 
            transition: all 0.3s ease; 
            font-family: inherit; 
        }
        .form-group input:focus, .form-group textarea:focus { 
            border-color: #667eea; 
            outline: none; 
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); 
        }
        .submit-btn { 
            width: 100%; 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white; 
            border: none; 
            padding: 16px; 
            border-radius: 10px; 
            font-size: 18px; 
            font-weight: bold; 
            cursor: pointer; 
            transition: all 0.3s ease; 
        }
        .submit-btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h2 class="form-title">${title}</h2>
        <form>${formFields}<button type="submit" class="submit-btn">Submit</button></form>
    </div>
</body>
</html>`;

    fs.writeFileSync(filePath, html, 'utf8');
    return { 
      success: true, 
      file: fileName, 
      path: filePath, 
      message: `Form "${title}" created successfully` 
    };
  }

  createPage(params) {
    const { title = 'New Page', sections = [] } = params;
    const timestamp = Date.now();
    const fileName = `page-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    const defaultSections = [
      { type: 'hero', title: title, subtitle: 'Welcome to our website' },
      { type: 'content', title: 'About Us', content: 'Sample content' }
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
        body { 
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 20px; 
        }
        .hero-section { 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white; 
            padding: 100px 0; 
            text-align: center; 
        }
        .hero-section h1 { 
            font-size: 3rem; 
            margin-bottom: 1rem; 
        }
        .hero-section p { 
            font-size: 1.2rem; 
            opacity: 0.9; 
        }
        .content-section { 
            padding: 80px 0; 
            background: #f8f9fa; 
        }
        .content-section h2 { 
            font-size: 2.5rem; 
            margin-bottom: 1rem; 
            text-align: center; 
        }
        .content-section p { 
            font-size: 1.1rem; 
            text-align: center; 
            max-width: 800px; 
            margin: 0 auto; 
        }
    </style>
</head>
<body>
    ${pageSections}
</body>
</html>`;

    fs.writeFileSync(filePath, html, 'utf8');
    return { 
      success: true, 
      file: fileName, 
      path: filePath, 
      message: `Page "${title}" created successfully` 
    };
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
        // Memory tools
        {
          name: 'store_memory',
          description: 'Store information in MCP memory',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Key for storage' },
              value: { type: 'object', description: 'Value to store' },
              category: { type: 'string', description: 'Category (optional)', default: 'general' },
              metadata: { type: 'object', description: 'Additional metadata (optional)' }
            },
            required: ['key', 'value']
          }
        },
        {
          name: 'retrieve_memory',
          description: 'Retrieve information from MCP memory',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Key to retrieve' }
            },
            required: ['key']
          }
        },
        {
          name: 'list_memory',
          description: 'List all memory items',
          inputSchema: {
            type: 'object',
            properties: {
              category: { type: 'string', description: 'Filter by category (optional)' }
            }
          }
        },
        {
          name: 'delete_memory',
          description: 'Delete information from memory',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Key to delete' }
            },
            required: ['key']
          }
        },
        // Service tools
        {
          name: 'list_services',
          description: 'List all available services',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'get_service_info',
          description: 'Get information about a specific service',
          inputSchema: {
            type: 'object',
            properties: {
              service: { type: 'string', description: 'Service name' }
            },
            required: ['service']
          }
        },
        {
          name: 'execute_service_command',
          description: 'Execute a command for a specific service',
          inputSchema: {
            type: 'object',
            properties: {
              service: { type: 'string', description: 'Service name' },
              command: { type: 'string', description: 'Command name' },
              parameters: { type: 'object', description: 'Command parameters' }
            },
            required: ['service', 'command']
          }
        },
        // Component tools
        {
          name: 'create_component',
          description: 'Create web component (button, card, form, page)',
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['button', 'card', 'form', 'page'], description: 'Component type' },
              parameters: { type: 'object', description: 'Component parameters' }
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
          // Memory operations
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
          // Service operations
          case 'list_services':
            result = this.listServices();
            break;
          case 'get_service_info':
            result = this.getServiceInfo(args.service);
            break;
          case 'execute_service_command':
            result = this.executeServiceCommand(args.service, args.command, args.parameters);
            break;
          // Component operations
          case 'create_component':
            result = this.executeServiceCommand('create', args.type, args.parameters);
            break;
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }

        this.log(`✅ ${name} executed (${Date.now() - t0}ms)`);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };

      } catch (error) {
        this.log(`❌ Error in ${name}: ${error.message}`, 'error');
        throw new McpError(ErrorCode.InternalError, `Error: ${error.message}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.log('🚀 Enhanced Cursor MCP Server connected - All Services Ready!');
  }
}

const server = new EnhancedCursorMCPServer();
server.run().catch(console.error);
