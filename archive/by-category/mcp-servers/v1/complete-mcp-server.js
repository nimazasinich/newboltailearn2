#!/usr/bin/env node

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
  GetCompletionsRequestSchema,
  LoggingLevel,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Complete MCP Server with ALL MCP Capabilities
class CompleteMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'complete-persian-mcp-server',
        version: '7.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: { listChanged: true },
          resources: { subscribe: true, listChanged: true },
          logging: {},
          completions: {},
        },
      }
    );

    // Paths
    this.memoryPath = process.env.MEMORY_PATH || './cursor-memory';
    this.outputPath = process.env.OUTPUT_PATH || './cursor-outputs';
    this.templatesPath = process.env.TEMPLATES_PATH || './cursor-templates';
    this.resourcesPath = process.env.RESOURCES_PATH || './cursor-resources';
    
    // Initialize
    this.ensureDirectories();
    this.setupAllHandlers();
    this.loadResources();
    this.loadPrompts();
    
    this.log('🚀 سرور MCP کامل با تمام قابلیت‌ها آماده!');
  }

  ensureDirectories() {
    const dirs = [this.memoryPath, this.outputPath, this.templatesPath, this.resourcesPath];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  log(message, level = LoggingLevel.INFO) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${level}] ${message}`);
  }

  setupAllHandlers() {
    // Initialize Handler
    this.server.setRequestHandler(InitializeRequestSchema, async () => {
      return {
        protocolVersion: "2025-06-18",
        capabilities: {
          tools: {},
          prompts: { listChanged: true },
          resources: { subscribe: true, listChanged: true },
          logging: {},
          completions: {},
        },
        serverInfo: {
          name: "complete-persian-mcp-server",
          version: "7.0.0",
        },
      };
    });

    // Tools Handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_element',
            description: 'ساخت المان‌های UI | Create UI elements',
            inputSchema: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['button', 'header', 'card', 'form', 'page'] },
                content: { type: 'object' },
                style: { type: 'string', enum: ['modern', 'minimal', 'glassmorphism'] },
                responsive: { type: 'boolean', default: true }
              },
              required: ['type', 'content']
            }
          },
          {
            name: 'memory_operation',
            description: 'عملیات حافظه | Memory operations',
            inputSchema: {
              type: 'object',
              properties: {
                action: { type: 'string', enum: ['save', 'recall', 'list', 'forget'] },
                content: { type: 'string' },
                category: { type: 'string' }
              },
              required: ['action']
            }
          },
          {
            name: 'code_generation',
            description: 'تولید کد | Code generation',
            inputSchema: {
              type: 'object',
              properties: {
                language: { type: 'string', enum: ['javascript', 'css', 'html', 'react'] },
                functionality: { type: 'string' },
                requirements: { type: 'object' }
              },
              required: ['language', 'functionality']
            }
          },
          {
            name: 'file_operation',
            description: 'عملیات فایل | File operations',
            inputSchema: {
              type: 'object',
              properties: {
                operation: { type: 'string', enum: ['read', 'write', 'list', 'delete'] },
                path: { type: 'string' },
                content: { type: 'string' }
              },
              required: ['operation', 'path']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        this.log(`🔧 اجرای ابزار: ${name}`);

        switch (name) {
          case 'create_element':
            return await this.handleCreateElement(args);
          case 'memory_operation':
            return await this.handleMemoryOperation(args);
          case 'code_generation':
            return await this.handleCodeGeneration(args);
          case 'file_operation':
            return await this.handleFileOperation(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `ابزار ناشناخته: ${name}`);
        }
      } catch (error) {
        this.log(`❌ خطا در ${name}: ${error.message}`, LoggingLevel.ERROR);
        throw new McpError(ErrorCode.InternalError, `خطا: ${error.message}`);
      }
    });

    // Prompts Handler
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'create_ui_element',
            description: 'راهنمای ساخت المان UI',
            arguments: [
              {
                name: 'element_type',
                description: 'نوع المان (button, header, card, form, page)',
                required: true
              },
              {
                name: 'style_preference',
                description: 'ترجیح سبک (modern, minimal, glassmorphism)',
                required: false
              }
            ]
          },
          {
            name: 'generate_code',
            description: 'راهنمای تولید کد',
            arguments: [
              {
                name: 'programming_language',
                description: 'زبان برنامه‌نویسی',
                required: true
              },
              {
                name: 'functionality',
                description: 'قابلیت مورد نظر',
                required: true
              }
            ]
          }
        ]
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'create_ui_element':
          return {
            description: `راهنمای ساخت ${args.element_type} با سبک ${args.style_preference || 'modern'}`,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `لطفاً ${args.element_type} با سبک ${args.style_preference || 'modern'} بسازید.`
                }
              }
            ]
          };
        case 'generate_code':
          return {
            description: `تولید کد ${args.programming_language} برای ${args.functionality}`,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `لطفاً کد ${args.programming_language} برای ${args.functionality} تولید کنید.`
                }
              }
            ]
          };
        default:
          throw new McpError(ErrorCode.MethodNotFound, `پیش‌فرم ناشناخته: ${name}`);
      }
    });

    // Resources Handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'memory://data',
            name: 'Memory Data',
            description: 'داده‌های حافظه سیستم',
            mimeType: 'application/json'
          },
          {
            uri: 'templates://ui',
            name: 'UI Templates',
            description: 'قالب‌های UI آماده',
            mimeType: 'text/html'
          },
          {
            uri: 'config://settings',
            name: 'Configuration',
            description: 'تنظیمات سیستم',
            mimeType: 'application/json'
          }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'memory://data':
          return {
            contents: [
              {
                uri: uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.getMemoryData(), null, 2)
              }
            ]
          };
        case 'templates://ui':
          return {
            contents: [
              {
                uri: uri,
                mimeType: 'text/html',
                text: this.getUITemplates()
              }
            ]
          };
        case 'config://settings':
          return {
            contents: [
              {
                uri: uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.getConfig(), null, 2)
              }
            ]
          };
        default:
          throw new McpError(ErrorCode.InvalidParams, `منبع ناشناخته: ${uri}`);
      }
    });

    // Completions Handler
    this.server.setRequestHandler(GetCompletionsRequestSchema, async (request) => {
      const { prompt, stopSequences, maxTokens } = request.params;
      
      // Simple completion logic
      const completions = this.generateCompletions(prompt, maxTokens || 100);
      
      return {
        items: completions.map(completion => ({
          index: 0,
          insertText: completion,
          isIncomplete: false
        }))
      };
    });
  }

  // Tool Handlers
  async handleCreateElement(args) {
    const { type, content, style = 'modern', responsive = true } = args;
    const timestamp = Date.now();
    const fileName = `${type}-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);

    let html = '';
    switch (type) {
      case 'button':
        html = this.createButtonHTML(content, style, responsive);
        break;
      case 'header':
        html = this.createHeaderHTML(content, style, responsive);
        break;
      case 'card':
        html = this.createCardHTML(content, style, responsive);
        break;
      case 'form':
        html = this.createFormHTML(content, style, responsive);
        break;
      case 'page':
        html = this.createPageHTML(content, style, responsive);
        break;
    }

    fs.writeFileSync(filePath, html, 'utf8');
    this.log(`✅ ${type} ساخته شد: ${fileName}`);

    return {
      content: [
        {
          type: 'text',
          text: `✅ ${type} با موفقیت ساخته شد!\n📁 فایل: ${fileName}\n📂 مسیر: ${filePath}`
        }
      ]
    };
  }

  async handleMemoryOperation(args) {
    const { action, content, category } = args;
    
    switch (action) {
      case 'save':
        return await this.saveToMemory(content, category);
      case 'recall':
        return await this.recallFromMemory(content);
      case 'list':
        return await this.listMemory();
      case 'forget':
        return await this.forgetFromMemory(content);
    }
  }

  async handleCodeGeneration(args) {
    const { language, functionality, requirements = {} } = args;
    const code = this.generateCode(language, functionality, requirements);
    
    const timestamp = Date.now();
    const extension = this.getFileExtension(language);
    const fileName = `generated-${timestamp}.${extension}`;
    const filePath = path.join(this.outputPath, fileName);
    
    fs.writeFileSync(filePath, code, 'utf8');
    
    return {
      content: [
        {
          type: 'text',
          text: `💻 کد ${language} تولید شد!\n📁 فایل: ${fileName}\n📂 مسیر: ${filePath}`
        }
      ]
    };
  }

  async handleFileOperation(args) {
    const { operation, path: filePath, content } = args;
    
    switch (operation) {
      case 'read': {
        if (!fs.existsSync(filePath)) {
          throw new Error('فایل یافت نشد');
        }
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return {
          content: [{ type: 'text', text: fileContent }]
        };
      }
      
      case 'write': {
        fs.writeFileSync(filePath, content, 'utf8');
        return {
          content: [{ type: 'text', text: 'فایل با موفقیت نوشته شد' }]
        };
      }
      
      case 'list': {
        const files = fs.readdirSync(filePath);
        return {
          content: [{ type: 'text', text: files.join('\n') }]
        };
      }
      
      case 'delete':
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return {
            content: [{ type: 'text', text: 'فایل حذف شد' }]
          };
        }
        throw new Error('فایل یافت نشد');
    }
  }

  // Memory Operations
  async saveToMemory(content, category = 'general') {
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
      content: [{ type: 'text', text: `💾 ذخیره شد: ${content}` }]
    };
  }

  async recallFromMemory(query) {
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
        content: [{ type: 'text', text: `❌ چیزی با "${query}" پیدا نشد` }]
      };
    }
    
    const resultText = results.map(item => 
      `📝 ${item.category}: ${item.content}`
    ).join('\n');
    
    return {
      content: [{ type: 'text', text: `🔍 یافت شد:\n\n${resultText}` }]
    };
  }

  async listMemory() {
    const allItems = [];
    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      allItems.push(...data);
    }
    
    if (allItems.length === 0) {
      return {
        content: [{ type: 'text', text: '📭 حافظه خالی است' }]
      };
    }
    
    const grouped = allItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    
    let listText = '📚 محتویات حافظه:\n\n';
    for (const [category, items] of Object.entries(grouped)) {
      listText += `🗂️ ${category}:\n`;
      items.forEach(item => {
        listText += `  • ${item.content}\n`;
      });
      listText += '\n';
    }
    
    return {
      content: [{ type: 'text', text: listText }]
    };
  }

  async forgetFromMemory(item) {
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

  // HTML Generators
  createButtonHTML(content, style, responsive) {
    const { text = 'دکمه', color = '#667eea', size = 'medium' } = content;
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>دکمه</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 50px; background: #f5f6fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .btn { background: linear-gradient(135deg, ${color}, ${this.darkenColor(color)}); color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; font-weight: 500; transition: all 0.3s ease; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
        ${responsive ? '@media (max-width: 768px) { .btn { width: 100%; } }' : ''}
    </style>
</head>
<body>
    <button class="btn">${text}</button>
</body>
</html>`;
  }

  createHeaderHTML(content, style, responsive) {
    const { title = 'عنوان', subtitle = '' } = content;
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>هدر</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px 0; text-align: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        ${responsive ? '@media (max-width: 768px) { h1 { font-size: 2rem; } }' : ''}
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <h1>${title}</h1>
            ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>
    </header>
</body>
</html>`;
  }

  createCardHTML(content, style, responsive) {
    const { title = 'عنوان کارت', description = 'توضیحات کارت' } = content;
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>کارت</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 50px; background: #f8f9fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 400px; transition: transform 0.3s ease; }
        .card:hover { transform: translateY(-5px); }
        h3 { font-size: 1.5rem; margin-bottom: 15px; color: #333; }
        p { color: #666; line-height: 1.6; }
        ${responsive ? '@media (max-width: 768px) { .card { max-width: 100%; } }' : ''}
    </style>
</head>
<body>
    <div class="card">
        <h3>${title}</h3>
        <p>${description}</p>
    </div>
</body>
</html>`;
  }

  createFormHTML(content, style, responsive) {
    const { title = 'فرم', fields = [] } = content;
    
    const fieldsHTML = fields.length > 0 ? 
      fields.map(field => `
        <div class="form-group">
          <label>${field.label}:</label>
          <input type="${field.type}" name="${field.name}" ${field.required ? 'required' : ''}>
        </div>
      `).join('') :
      `
        <div class="form-group">
          <label>نام:</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group">
          <label>ایمیل:</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>پیام:</label>
          <textarea name="message" rows="4" required></textarea>
        </div>
      `;
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فرم</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 50px; background: linear-gradient(135deg, #667eea, #764ba2); min-height: 100vh; display: flex; justify-content: center; align-items: center; }
        .form { background: rgba(255,255,255,0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; backdrop-filter: blur(10px); }
        h2 { text-align: center; margin-bottom: 30px; color: #333; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; }
        input, textarea { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; }
        button { width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 16px; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; }
        ${responsive ? '@media (max-width: 768px) { .form { padding: 30px 20px; } }' : ''}
    </style>
</head>
<body>
    <form class="form">
        <h2>${title}</h2>
        ${fieldsHTML}
        <button type="submit">ارسال</button>
    </form>
</body>
</html>`;
  }

  createPageHTML(content, style, responsive) {
    const { title = 'صفحه', sections = [] } = content;
    
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
        .content { padding: 60px 0; background: #f8f9fa; text-align: center; }
        ${responsive ? '@media (max-width: 768px) { h1 { font-size: 2rem; } }' : ''}
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>${title}</h1>
            <p>صفحه ساخته شده با MCP Server</p>
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

  // Code Generation
  generateCode(language, functionality, requirements) {
    const templates = {
      javascript: {
        'button': `// Interactive Button Component
class InteractiveButton {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { ripple: true, ...options };
        this.init();
    }
    
    init() {
        this.element.addEventListener('click', (e) => this.handleClick(e));
    }
    
    handleClick(e) {
        console.log('Button clicked!');
        // Add your functionality here
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.interactive-btn');
    buttons.forEach(btn => new InteractiveButton(btn));
});`,
        'form': `// Form Validation
class FormValidator {
    constructor(form) {
        this.form = form;
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
            }
        });
    }
    
    validate() {
        const inputs = this.form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showError(input, 'این فیلد الزامی است');
                isValid = false;
            } else {
                this.clearError(input);
            }
        });
        
        return isValid;
    }
    
    showError(input, message) {
        input.classList.add('error');
        // Add error display logic
    }
    
    clearError(input) {
        input.classList.remove('error');
    }
}

// Usage
const form = document.getElementById('myForm');
new FormValidator(form);`
      },
      css: {
        'modern': `/* Modern CSS Framework */
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --success: #2ecc71;
    --danger: #e74c3c;
    --warning: #f39c12;
    --info: #3498db;
}

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

.btn {
    display: inline-block;
    padding: 12px 24px;
    background: var(--primary);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.card {
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-size: 16px;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: var(--primary);
    outline: none;
}

@media (max-width: 768px) {
    .container { padding: 0 15px; }
    .btn { width: 100%; }
}`
      }
    };

    return templates[language]?.[functionality] || `// ${functionality} in ${language}\n// Generated code\nconsole.log('${functionality} functionality');`;
  }

  getFileExtension(language) {
    const extensions = {
      javascript: 'js',
      css: 'css',
      html: 'html',
      react: 'jsx'
    };
    return extensions[language] || 'txt';
  }

  // Resource Management
  loadResources() {
    // Load available resources
  }

  loadPrompts() {
    // Load available prompts
  }

  getMemoryData() {
    const data = {};
    const files = fs.readdirSync(this.memoryPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(this.memoryPath, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      data[file.replace('.json', '')] = content;
    }
    
    return data;
  }

  getUITemplates() {
    return `<!-- UI Templates -->
<div class="template-button">
    <button class="btn btn-primary">دکمه اصلی</button>
</div>

<div class="template-card">
    <div class="card">
        <h3>عنوان کارت</h3>
        <p>محتوای کارت</p>
    </div>
</div>

<div class="template-form">
    <form class="form">
        <div class="form-group">
            <label>نام:</label>
            <input type="text" required>
        </div>
        <button type="submit">ارسال</button>
    </form>
</div>`;
  }

  getConfig() {
    return {
      version: "7.0.0",
      capabilities: {
        tools: true,
        prompts: true,
        resources: true,
        logging: true,
        completions: true
      },
      paths: {
        memory: this.memoryPath,
        output: this.outputPath,
        templates: this.templatesPath,
        resources: this.resourcesPath
      }
    };
  }

  generateCompletions(prompt, maxTokens) {
    // Simple completion logic
    const completions = [
      'دکمه آبی',
      'هدر مدرن',
      'کارت زیبا',
      'فرم تماس',
      'صفحه فرود'
    ];
    
    return completions.filter(comp => 
      comp.toLowerCase().includes(prompt.toLowerCase())
    ).slice(0, 3);
  }

  darkenColor(color) {
    return color.replace(/[0-9a-f]/g, (match) => {
      const val = parseInt(match, 16);
      return Math.max(0, val - 2).toString(16);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 سرور MCP کامل با تمام قابلیت‌ها آماده!');
  }
}

const server = new CompleteMCPServer();
server.run().catch(console.error);
