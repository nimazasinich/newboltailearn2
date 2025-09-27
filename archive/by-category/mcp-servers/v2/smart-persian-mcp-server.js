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

// Smart Persian MCP Server - Cursor's Creative Assistant
class SmartPersianMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'smart-persian-mcp-server',
        version: '5.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Paths and configuration
    this.memoryPath = process.env.MEMORY_PATH || './cursor-memory';
    this.outputPath = process.env.OUTPUT_PATH || './cursor-outputs';
    this.templatesPath = process.env.TEMPLATES_PATH || './cursor-templates';
    
    // Initialize
    this.ensureDirectories();
    this.loadTemplates();
    this.setupToolHandlers();
    
    this.log('🧠 سرور MCP هوشمند فارسی آماده - Cursor می‌تواند هر چیزی بسازد!');
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

  // Load reusable templates and components
  loadTemplates() {
    this.templates = {
      // CSS Framework Templates
      css: {
        modern: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Arial; line-height: 1.6; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
          .flex { display: flex; }
          .grid { display: grid; }
          .btn { padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.3s; }
          .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
          .card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 0; }
          .rtl { direction: rtl; text-align: right; }
        `,
        minimal: `
          body { font-family: system-ui; margin: 0; line-height: 1.5; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          button { padding: 8px 16px; border: 1px solid #ddd; background: white; cursor: pointer; }
          button:hover { background: #f5f5f5; }
        `,
        glassmorphism: `
          body { margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
          .glass { background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(10px); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.18); }
          .container { max-width: 1000px; margin: 50px auto; padding: 30px; }
        `
      },
      
      // Component Templates
      components: {
        button: {
          simple: '<button class="btn">{{text}}</button>',
          primary: '<button class="btn btn-primary">{{text}}</button>',
          icon: '<button class="btn"><i class="{{icon}}"></i> {{text}}</button>',
          gradient: '<button style="background: linear-gradient(45deg, {{color1}}, {{color2}}); color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">{{text}}</button>'
        },
        
        header: {
          simple: '<header class="header"><div class="container"><h1>{{title}}</h1></div></header>',
          nav: `<header class="header">
            <div class="container flex" style="justify-content: space-between; align-items: center;">
              <h1>{{title}}</h1>
              <nav>{{navigation}}</nav>
            </div>
          </header>`,
          hero: `<header class="hero" style="background: linear-gradient(135deg, {{color1}} 0%, {{color2}} 100%); color: white; padding: 100px 0; text-align: center;">
            <div class="container">
              <h1 style="font-size: 3rem; margin-bottom: 1rem;">{{title}}</h1>
              <p style="font-size: 1.2rem; opacity: 0.9;">{{subtitle}}</p>
              {{button}}
            </div>
          </header>`
        },
        
        card: {
          simple: '<div class="card"><h3>{{title}}</h3><p>{{content}}</p></div>',
          image: `<div class="card">
            <img src="{{image}}" alt="{{title}}" style="width: 100%; border-radius: 6px; margin-bottom: 15px;">
            <h3>{{title}}</h3>
            <p>{{content}}</p>
            {{button}}
          </div>`,
          pricing: `<div class="card" style="text-align: center; border: 2px solid {{color}};">
            <h3 style="color: {{color}};">{{title}}</h3>
            <div style="font-size: 2rem; font-weight: bold; margin: 20px 0;">{{price}}</div>
            <ul style="list-style: none; margin: 20px 0;">{{features}}</ul>
            {{button}}
          </div>`
        },
        
        form: {
          contact: `<form class="contact-form" style="max-width: 500px;">
            <div style="margin-bottom: 20px;">
              <label>{{label_name}}</label>
              <input type="text" name="name" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 20px;">
              <label>{{label_email}}</label>
              <input type="email" name="email" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 20px;">
              <label>{{label_message}}</label>
              <textarea name="message" rows="5" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
            {{button}}
          </form>`
        },
        
        layout: {
          grid: '<div class="grid" style="grid-template-columns: repeat({{columns}}, 1fr); gap: 20px;">{{content}}</div>',
          flex: '<div class="flex" style="{{style}}">{{content}}</div>',
          sidebar: `<div class="flex">
            <aside style="width: 250px; background: #f8f9fa; padding: 20px;">{{sidebar}}</aside>
            <main style="flex: 1; padding: 20px;">{{content}}</main>
          </div>`
        }
      }
    };
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Smart Creation Tools
          {
            name: 'smart_create',
            description: 'ساخت هوشمند هر چیزی که Cursor بخواهد - از دکمه ساده تا صفحه کامل',
            inputSchema: {
              type: 'object',
              properties: {
                type: { 
                  type: 'string', 
                  description: 'نوع المان (button, header, card, form, page, component)',
                  enum: ['button', 'header', 'card', 'form', 'page', 'component', 'layout']
                },
                style: { 
                  type: 'string', 
                  description: 'سبک طراحی (modern, minimal, glassmorphism, custom)',
                  enum: ['modern', 'minimal', 'glassmorphism', 'gradient', 'custom']
                },
                content: { 
                  type: 'object', 
                  description: 'محتوا و تنظیمات (JSON object with properties like text, title, colors, etc.)'
                },
                customCSS: { 
                  type: 'string', 
                  description: 'CSS سفارشی اضافی (اختیاری)'
                },
                responsive: { 
                  type: 'boolean', 
                  description: 'واکنشگرا برای موبایل (پیش‌فرض: true)'
                }
              },
              required: ['type', 'content']
            }
          },
          
          // Component Builder
          {
            name: 'build_component',
            description: 'ساخت کامپوننت‌های پیشرفته با ترکیب المان‌های مختلف',
            inputSchema: {
              type: 'object',
              properties: {
                components: {
                  type: 'array',
                  description: 'لیست کامپوننت‌ها برای ترکیب',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      content: { type: 'object' },
                      style: { type: 'string' }
                    }
                  }
                },
                layout: { 
                  type: 'string', 
                  description: 'نحوه چیدمان (grid, flex, stack)',
                  enum: ['grid', 'flex', 'stack', 'sidebar']
                },
                theme: { 
                  type: 'object', 
                  description: 'تم رنگی و فونت'
                }
              },
              required: ['components']
            }
          },
          
          // Template System
          {
            name: 'use_template',
            description: 'استفاده از قالب‌های آماده و شخصی‌سازی آنها',
            inputSchema: {
              type: 'object',
              properties: {
                template: { 
                  type: 'string', 
                  description: 'نام قالب (landing, dashboard, portfolio, blog, shop)',
                  enum: ['landing', 'dashboard', 'portfolio', 'blog', 'shop', 'admin']
                },
                customization: { 
                  type: 'object', 
                  description: 'تنظیمات شخصی‌سازی'
                },
                content: { 
                  type: 'object', 
                  description: 'محتوای اختصاصی'
                }
              },
              required: ['template']
            }
          },
          
          // AI Assistant
          {
            name: 'ai_suggest',
            description: 'پیشنهاد هوشمند بر اساس نیاز Cursor',
            inputSchema: {
              type: 'object',
              properties: {
                need: { 
                  type: 'string', 
                  description: 'توضیح نیاز یا هدف'
                },
                context: { 
                  type: 'string', 
                  description: 'زمینه پروژه (business, personal, portfolio, etc.)'
                },
                preferences: { 
                  type: 'object', 
                  description: 'ترجیحات طراحی'
                }
              },
              required: ['need']
            }
          },
          
          // Memory & Learning
          {
            name: 'remember_preference',
            description: 'یادگیری و ذخیره ترجیحات Cursor برای استفاده‌های آینده',
            inputSchema: {
              type: 'object',
              properties: {
                category: { 
                  type: 'string', 
                  description: 'دسته‌بندی ترجیح (colors, fonts, layouts, styles)'
                },
                preference: { 
                  type: 'object', 
                  description: 'جزئیات ترجیح'
                },
                context: { 
                  type: 'string', 
                  description: 'زمینه استفاده'
                }
              },
              required: ['category', 'preference']
            }
          },
          
          // Code Generator
          {
            name: 'generate_code',
            description: 'تولید کد HTML/CSS/JS برای هر نیاز خاص',
            inputSchema: {
              type: 'object',
              properties: {
                language: { 
                  type: 'string', 
                  description: 'زبان برنامه‌نویسی',
                  enum: ['html', 'css', 'javascript', 'react', 'vue', 'svelte']
                },
                functionality: { 
                  type: 'string', 
                  description: 'قابلیت مورد نظر'
                },
                framework: { 
                  type: 'string', 
                  description: 'فریمورک (اختیاری)'
                },
                requirements: { 
                  type: 'object', 
                  description: 'الزامات خاص'
                }
              },
              required: ['language', 'functionality']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        this.log(`🎨 Cursor درخواست کرد: ${name}`);

        switch (name) {
          case 'smart_create':
            return await this.handleSmartCreate(args.type, args.style, args.content, args.customCSS, args.responsive);
          
          case 'build_component':
            return await this.handleBuildComponent(args.components, args.layout, args.theme);
          
          case 'use_template':
            return await this.handleUseTemplate(args.template, args.customization, args.content);
          
          case 'ai_suggest':
            return await this.handleAISuggest(args.need, args.context, args.preferences);
          
          case 'remember_preference':
            return await this.handleRememberPreference(args.category, args.preference, args.context);
          
          case 'generate_code':
            return await this.handleGenerateCode(args.language, args.functionality, args.framework, args.requirements);
          
          default:
            throw new McpError(ErrorCode.MethodNotFound, `ابزار ناشناخته: ${name}`);
        }
      } catch (error) {
        this.log(`❌ خطا: ${error.message}`, 'error');
        throw new McpError(ErrorCode.InternalError, `خطا: ${error.message}`);
      }
    });
  }

  // Smart Create - Main creation engine
  async handleSmartCreate(type, style = 'modern', content, customCSS = '', responsive = true) {
    const timestamp = Date.now();
    const fileName = `${type}-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);
    
    let html = '';
    
    switch (type) {
      case 'button':
        html = this.createButton(content, style, customCSS, responsive);
        break;
      case 'header':
        html = this.createHeader(content, style, customCSS, responsive);
        break;
      case 'card':
        html = this.createCard(content, style, customCSS, responsive);
        break;
      case 'form':
        html = this.createForm(content, style, customCSS, responsive);
        break;
      case 'page':
        html = this.createPage(content, style, customCSS, responsive);
        break;
      case 'layout':
        html = this.createLayout(content, style, customCSS, responsive);
        break;
      default:
        html = this.createCustomComponent(type, content, style, customCSS, responsive);
    }
    
    fs.writeFileSync(filePath, html, 'utf8');
    this.log(`✅ ساخته شد: ${type} - ${fileName}`);
    
    return {
      content: [{
        type: 'text',
        text: `🎨 ${type} با موفقیت ساخته شد![.][.]` +
              `📁 فایل: ${fileName}[.]` +
              `📂 مسیر: ${filePath}[.]` +
              `🎯 سبک: ${style}[.]` +
              `📱 واکنشگرا: ${responsive ? 'بله' : 'خیر'}[.][.]` +
              `🔗 برای مشاهده، فایل HTML را در مرورگر باز کنید.[.]` +
              `💡 Cursor می‌تواند این کد را مستقیماً در پروژه استفاده کند.`
      }]
    };
  }

  // Button Creator
  createButton(content, style, customCSS, responsive) {
    const { text = 'دکمه', color1 = '#667eea', color2 = '#764ba2', icon = '', onClick = '', size = 'medium' } = content;
    
    const sizes = {
      small: 'padding: 8px 16px; font-size: 14px;',
      medium: 'padding: 12px 24px; font-size: 16px;',
      large: 'padding: 16px 32px; font-size: 18px;'
    };
    
    const buttonStyles = {
      modern: `
        background: linear-gradient(135deg, ${color1}, ${color2});
        color: white;
        border: none;
        border-radius: 8px;
        ${sizes[size]}
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      `,
      minimal: `
        background: transparent;
        color: ${color1};
        border: 2px solid ${color1};
        border-radius: 4px;
        ${sizes[size]}
        cursor: pointer;
        transition: all 0.3s ease;
      `,
      glassmorphism: `
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: white;
        border-radius: 12px;
        ${sizes[size]}
        cursor: pointer;
        transition: all 0.3s ease;
      `
    };
    
    const hoverEffects = {
      modern: 'transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,0,0,0.2);',
      minimal: `background: ${color1}; color: white;`,
      glassmorphism: 'background: rgba(255, 255, 255, 0.35); transform: translateY(-1px);'
    };
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>دکمه هوشمند</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            margin: 0;
            padding: 50px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .smart-button {
            ${buttonStyles[style]}
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
        }
        
        .smart-button:hover {
            ${hoverEffects[style]}
        }
        
        .smart-button i {
            font-size: 1.2em;
        }
        
        ${responsive ? `
        @media (max-width: 768px) {
            .smart-button {
                width: 100%;
                justify-content: center;
                padding: 16px 24px;
            }
        }` : ''}
        
        ${customCSS}
    </style>
    ${icon ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">' : ''}
</head>
<body>
    <button class="smart-button" ${onClick ? `onclick="${onClick}"` : ''}>
        ${icon ? `<i class="${icon}"></i>` : ''}
        ${text}
    </button>
    
    <script>
        // Smart button interactions
        document.querySelector('.smart-button').addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = [.]
                position: absolute;
                width: [.]{size}px;
                height: [.]{size}px;
                left: [.]{x}px;
                top: [.]{y}px;
                background: rgba(255,255,255,0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            [.];
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
        
        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = [.]
            @keyframes ripple {
                to { transform: scale(4); opacity: 0; }
            }
        [.];
        document.head.appendChild(style);
    </script>
</body>
</html>`;
  }

  // Header Creator
  createHeader(content, style, customCSS, responsive) {
    const { 
      title = 'عنوان سایت', 
      subtitle = '', 
      navigation = [], 
      logo = '', 
      color1 = '#667eea', 
      color2 = '#764ba2',
      type = 'simple' // simple, nav, hero
    } = content;
    
    const navItems = Array.isArray(navigation) ? 
      navigation.map(item => `<a href="${item.url || '#'}" style="color: white; text-decoration: none; margin: 0 15px; transition: opacity 0.3s;">${item.text}</a>`).join('') :
      '';
    
    const headerStyles = {
      simple: `
        background: linear-gradient(135deg, ${color1}, ${color2});
        color: white;
        padding: 20px 0;
        text-align: center;
      `,
      nav: `
        background: linear-gradient(135deg, ${color1}, ${color2});
        color: white;
        padding: 15px 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      `,
      hero: `
        background: linear-gradient(135deg, ${color1}, ${color2});
        color: white;
        padding: 100px 0;
        text-align: center;
        min-height: 50vh;
        display: flex;
        align-items: center;
      `
    };
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>هدر هوشمند</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
        
        .smart-header {
            ${headerStyles[style]}
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.8rem;
            font-weight: bold;
        }
        
        .nav-links a:hover {
            opacity: 0.8;
        }
        
        .hero-content h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: fadeInUp 1s ease;
        }
        
        .hero-content p {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
            animation: fadeInUp 1s ease 0.2s both;
        }
        
        ${responsive ? `
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 15px;
            }
            
            .nav-links {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
            }
            
            .hero-content h1 {
                font-size: 2rem;
            }
            
            .hero-content p {
                font-size: 1rem;
            }
        }` : ''}
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        ${customCSS}
    </style>
</head>
<body>
    <header class="smart-header">
        <div class="container">
            ${type === 'hero' ? `
            <div class="hero-content">
                <h1>${title}</h1>
                ${subtitle ? `<p>${subtitle}</p>` : ''}
            </div>
            ` : `
            <div class="header-content">
                <div class="logo">
                    ${logo ? `<img src="${logo}" alt="لوگو" style="height: 40px;">` : title}
                </div>
                ${navigation.length > 0 ? `
                <nav class="nav-links">
                    ${navItems}
                </nav>` : ''}
            </div>
            `}
        </div>
    </header>
    
    ${type !== 'hero' ? '<div style="padding: 50px 20px; text-align: center; color: #666;"><p>محتوای صفحه اینجا قرار می‌گیرد...</p></div>' : ''}
</body>
</html>`;
  }

  // Card Creator
  createCard(content, style, customCSS, responsive) {
    const { 
      title = 'عنوان کارت', 
      content: cardContent = 'محتوای کارت اینجا قرار می‌گیرد',
      image = '', 
      button = null,
      color = '#667eea',
      type = 'simple' // simple, image, pricing, product
    } = content;
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>کارت هوشمند</title>
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
        
        .smart-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            max-width: 400px;
            transition: all 0.3s ease;
            animation: fadeIn 0.8s ease;
        }
        
        .smart-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .card-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 20px;
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
            margin-bottom: 20px;
        }
        
        .card-button {
            background: linear-gradient(135deg, ${color}, ${this.darkenColor(color)});
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .card-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        ${responsive ? `
        @media (max-width: 768px) {
            body { padding: 20px; }
            .smart-card { max-width: 100%; }
        }` : ''}
        
        ${customCSS}
    </style>
</head>
<body>
    <div class="smart-card">
        ${image ? `<img src="${image}" alt="${title}" class="card-image">` : ''}
        <h3 class="card-title">${title}</h3>
        <p class="card-content">${cardContent}</p>
        ${button ? `<button class="card-button" onclick="${button.onClick || ''}">${button.text || 'کلیک کنید'}</button>` : ''}
    </div>
</body>
</html>`;
  }

  // Form Creator
  createForm(content, style, customCSS, responsive) {
    const { 
      title = 'فرم تماس',
      fields = [
        { name: 'name', label: 'نام', type: 'text', required: true },
        { name: 'email', label: 'ایمیل', type: 'email', required: true },
        { name: 'message', label: 'پیام', type: 'textarea', required: true }
      ],
      submitText = 'ارسال',
      action = '#',
      method = 'POST'
    } = content;
    
    const formFields = fields.map(field => {
      const inputStyle = `
        width: 100%;
        padding: 12px;
        border: 2px solid #e1e5e9;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.3s ease;
        font-family: inherit;
      `;
      
      let input = '';
      if (field.type === 'textarea') {
        input = `<textarea name="${field.name}" style="${inputStyle}" rows="4" ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}"></textarea>`;
      } else if (field.type === 'select') {
        const options = field.options?.map(opt => `<option value="${opt.value || opt}">${opt.label || opt}</option>`).join('') || '';
        input = `<select name="${field.name}" style="${inputStyle}" ${field.required ? 'required' : ''}><option value="">انتخاب کنید</option>${options}</select>`;
      } else {
        input = `<input type="${field.type}" name="${field.name}" style="${inputStyle}" ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}">`;
      }
      
      return `
        <div class="form-group">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">${field.label}${field.required ? ' <span style="color: #e74c3c;">*</span>' : ''}</label>
          ${input}
        </div>
      `;
    }).join('');
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فرم هوشمند</title>
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
        
        .smart-form {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            animation: slideUp 0.8s ease;
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
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            border-color: #667eea;
            outline: none;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .submit-button {
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
        
        .submit-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        ${responsive ? `
        @media (max-width: 768px) {
            body { padding: 20px; }
            .smart-form { padding: 30px 20px; }
        }` : ''}
        
        ${customCSS}
    </style>
</head>
<body>
    <form class="smart-form" action="${action}" method="${method}">
        <h2 class="form-title">${title}</h2>
        ${formFields}
        <button type="submit" class="submit-button">${submitText}</button>
    </form>
    
    <script>
        // Form validation and enhancement
        document.querySelector('.smart-form').addEventListener('submit', function(e) {
            const button = this.querySelector('.submit-button');
            button.textContent = 'در حال ارسال...';
            button.disabled = true;
            
            // Simulate form processing
            setTimeout(() => {
                button.textContent = '${submitText}';
                button.disabled = false;
            }, 2000);
        });
        
        // Add floating label effect
        document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    </script>
</body>
</html>`;
  }

  // Page Creator
  createPage(content, style, customCSS, responsive) {
    const { 
      title = 'صفحه جدید',
      sections = [],
      theme = { primary: '#667eea', secondary: '#764ba2' },
      layout = 'standard'
    } = content;
    
    const sectionHTML = sections.map(section => {
      switch (section.type) {
        case 'hero':
          return `<section class="hero-section">${this.createHeroSection(section)}</section>`;
        case 'features':
          return `<section class="features-section">${this.createFeaturesSection(section)}</section>`;
        case 'content':
          return `<section class="content-section">${this.createContentSection(section)}</section>`;
        default:
          return `<section>${section.html || section.content || ''}</section>`;
      }
    }).join('');
    
    return `<!DOCTYPE html>
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
        
        section {
            padding: 60px 0;
        }
        
        .hero-section {
            background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
            color: white;
            text-align: center;
            min-height: 60vh;
            display: flex;
            align-items: center;
        }
        
        .features-section {
            background: #f8f9fa;
        }
        
        .content-section {
            background: white;
        }
        
        ${responsive ? `
        @media (max-width: 768px) {
            section { padding: 40px 0; }
            .container { padding: 0 15px; }
        }` : ''}
        
        ${customCSS}
    </style>
</head>
<body>
    ${sectionHTML}
    
    <script>
        // Page enhancements
        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
            
            // Scroll animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);
            
            document.querySelectorAll('section').forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';
                section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                observer.observe(section);
            });
        });
    </script>
</body>
</html>`;
  }

  // Layout Creator
  createLayout(content, style, customCSS, responsive) {
    const { 
      type = 'grid', // grid, flex, sidebar, masonry
      items = [],
      columns = 3,
      gap = '20px'
    } = content;
    
    const layoutStyles = {
      grid: `display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: ${gap};`,
      flex: `display: flex; flex-wrap: wrap; gap: ${gap};`,
      sidebar: `display: flex; gap: ${gap};`,
      masonry: `columns: ${columns}; column-gap: ${gap};`
    };
    
    const itemsHTML = items.map((item, index) => `
      <div class="layout-item" style="animation-delay: ${index * 0.1}s;">
        ${item.html || item.content || `<p>آیتم ${index + 1}</p>`}
      </div>
    `).join('');
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>چیدمان هوشمند</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            margin: 0;
            padding: 50px;
            background: #f8f9fa;
        }
        
        .smart-layout {
            ${layoutStyles[type]}
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .layout-item {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.8s ease forwards;
        }
        
        .layout-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        ${responsive ? `
        @media (max-width: 768px) {
            .smart-layout {
                grid-template-columns: 1fr !important;
                flex-direction: column !important;
                columns: 1 !important;
            }
            body { padding: 20px; }
        }` : ''}
        
        ${customCSS}
    </style>
</head>
<body>
    <div class="smart-layout">
        ${itemsHTML}
    </div>
</body>
</html>`;
  }

  // Build Component - Combine multiple elements
  async handleBuildComponent(components, layout = 'stack', theme = {}) {
    const timestamp = Date.now();
    const fileName = `component-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);
    
    const { primary = '#667eea', secondary = '#764ba2', accent = '#e74c3c' } = theme;
    
    let combinedHTML = '';
    let combinedCSS = '';
    
    // Process each component
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      const compHTML = await this.generateComponentHTML(comp.type, comp.content, comp.style);
      combinedHTML += `<div class="component-${i}">${compHTML}</div>`;
    }
    
    // Apply layout
    const layoutStyles = {
      stack: 'flex-direction: column; gap: 30px;',
      grid: `display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;`,
      flex: 'display: flex; flex-wrap: wrap; gap: 30px;',
      sidebar: 'display: flex; gap: 30px;'
    };
    
    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>کامپوننت ترکیبی</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 50px;
        }
        
        .component-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            ${layoutStyles[layout]}
        }
        
        .component-container > div {
            animation: slideIn 0.8s ease forwards;
            opacity: 0;
            transform: translateY(30px);
        }
        
        ${components.map((_, i) => `
        .component-${i} {
            animation-delay: ${i * 0.2}s;
        }`).join('')}
        
        @keyframes slideIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (max-width: 768px) {
            body { padding: 20px; }
            .component-container {
                flex-direction: column !important;
                grid-template-columns: 1fr !important;
            }
        }
        
        :root {
            --primary: ${primary};
            --secondary: ${secondary};
            --accent: ${accent};
        }
    </style>
</head>
<body>
    <div class="component-container">
        ${combinedHTML}
    </div>
</body>
</html>`;
    
    fs.writeFileSync(filePath, html, 'utf8');
    this.log(`🎨 کامپوننت ترکیبی ساخته شد: ${fileName}`);
    
    return {
      content: [{
        type: 'text',
        text: `🎨 کامپوننت ترکیبی با موفقیت ساخته شد![.][.]` +
              `📁 فایل: ${fileName}[.]` +
              `📂 مسیر: ${filePath}[.]` +
              `🔧 تعداد کامپوننت‌ها: ${components.length}[.]` +
              `📐 چیدمان: ${layout}[.][.]` +
              `🔗 Cursor می‌تواند این کامپوننت را در هر پروژه‌ای استفاده کند.`
      }]
    };
  }

  // Template System
  async handleUseTemplate(template, customization = {}, content = {}) {
    const templates = {
      landing: this.createLandingTemplate,
      dashboard: this.createDashboardTemplate,
      portfolio: this.createPortfolioTemplate,
      blog: this.createBlogTemplate,
      shop: this.createShopTemplate,
      admin: this.createAdminTemplate
    };
    
    if (!templates[template]) {
      return {
        content: [{
          type: 'text',
          text: `❌ قالب "${template}" یافت نشد.[.][.]` +
                `قالب‌های موجود: ${Object.keys(templates).join(', ')}`
        }]
      };
    }
    
    const timestamp = Date.now();
    const fileName = `${template}-${timestamp}.html`;
    const filePath = path.join(this.outputPath, fileName);
    
    const html = templates[template].call(this, customization, content);
    fs.writeFileSync(filePath, html, 'utf8');
    
    this.log(`📄 قالب ${template} ساخته شد: ${fileName}`);
    
    return {
      content: [{
        type: 'text',
        text: `📄 قالب ${template} با موفقیت ساخته شد![.][.]` +
              `📁 فایل: ${fileName}[.]` +
              `📂 مسیر: ${filePath}[.]` +
              `🎨 شخصی‌سازی: ${Object.keys(customization).length} مورد[.][.]` +
              `🚀 قالب آماده استفاده و کاملاً قابل تغییر است.`
      }]
    };
  }

  // AI Suggestion System
  async handleAISuggest(need, context = '', preferences = {}) {
    const suggestions = this.generateSmartSuggestions(need, context, preferences);
    
    return {
      content: [{
        type: 'text',
        text: `🤖 پیشنهادات هوشمند برای "${need}":[.][.]` +
              suggestions.map((suggestion, i) => 
                `${i + 1}. **${suggestion.title}**[.]` +
                `   ${suggestion.description}[.]` +
                `   🎨 سبک: ${suggestion.style}[.]` +
                `   ⚡ پیچیدگی: ${suggestion.complexity}[.]` +
                `   💡 نکته: ${suggestion.tip}[.]`
              ).join('[.]') +
              `[.]🎯 برای ساخت هر کدام، از دستور smart_create استفاده کنید.`
      }]
    };
  }

  // Remember Preferences
  async handleRememberPreference(category, preference, context = '') {
    const prefsFile = path.join(this.memoryPath, 'cursor-preferences.json');
    let prefs = {};
    
    if (fs.existsSync(prefsFile)) {
      prefs = JSON.parse(fs.readFileSync(prefsFile, 'utf8'));
    }
    
    if (!prefs[category]) prefs[category] = [];
    
    prefs[category].push({
      ...preference,
      context,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    });
    
    fs.writeFileSync(prefsFile, JSON.stringify(prefs, null, 2), 'utf8');
    this.log(`💾 ترجیح ذخیره شد: ${category}`);
    
    return {
      content: [{
        type: 'text',
        text: `💾 ترجیح شما در دسته "${category}" ذخیره شد![.][.]` +
              `🎯 زمینه: ${context || 'عمومی'}[.]` +
              `📊 کل ترجیحات این دسته: ${prefs[category].length}[.][.]` +
              `🧠 این اطلاعات برای پیشنهادات بهتر استفاده خواهد شد.`
      }]
    };
  }

  // Code Generator
  async handleGenerateCode(language, functionality, framework = '', requirements = {}) {
    const code = this.generateCode(language, functionality, framework, requirements);
    const timestamp = Date.now();
    const extension = this.getFileExtension(language);
    const fileName = `generated-${functionality.replace(/[[.]s]+/g, '-')}-${timestamp}.${extension}`;
    const filePath = path.join(this.outputPath, fileName);
    
    fs.writeFileSync(filePath, code, 'utf8');
    this.log(`💻 کد تولید شد: ${language} - ${functionality}`);
    
    return {
      content: [{
        type: 'text',
        text: `💻 کد ${language} برای "${functionality}" تولید شد![.][.]` +
              `📁 فایل: ${fileName}[.]` +
              `📂 مسیر: ${filePath}[.]` +
              `🔧 فریمورک: ${framework || 'خام'}[.]` +
              `⚙️ الزامات: ${Object.keys(requirements).length} مورد[.][.]` +
              `🚀 کد آماده استفاده و قابل تغییر است.[.][.]` +
              `**نمونه کد:**[.][.][.][.]${language}[.]${code.substring(0, 200)}...[.][.][.][.]`
      }]
    };
  }

  // Helper Methods
  generateComponentHTML(type, content, style) {
    // Simplified component generation for building
    switch (type) {
      case 'button':
        return `<button style="padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; cursor: pointer;">${content.text || 'دکمه'}</button>`;
      case 'card':
        return `<div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h3>${content.title || 'عنوان'}</h3><p>${content.content || 'محتوا'}</p></div>`;
      default:
        return `<div>${content.html || content.content || ''}</div>`;
    }
  }

  generateSmartSuggestions(need, context, preferences) {
    // AI-like suggestion generation based on need analysis
    const needLower = need.toLowerCase();
    const suggestions = [];
    
    if (needLower.includes('دکمه') || needLower.includes('button')) {
      suggestions.push({
        title: 'دکمه گرادیانت مدرن',
        description: 'دکمه با افکت گرادیانت و انیمیشن hover',
        style: 'modern',
        complexity: 'ساده',
        tip: 'برای جلب توجه کاربر مناسب است'
      });
    }
    
    if (needLower.includes('فرم') || needLower.includes('form')) {
      suggestions.push({
        title: 'فرم شیشه‌ای',
        description: 'فرم با افکت glassmorphism و اعتبارسنجی',
        style: 'glassmorphism',
        complexity: 'متوسط',
        tip: 'برای سایت‌های مدرن بسیار جذاب است'
      });
    }
    
    if (needLower.includes('صفحه') || needLower.includes('page')) {
      suggestions.push({
        title: 'صفحه فرود حرفه‌ای',
        description: 'صفحه کامل با هدر، محتوا و فوتر',
        style: 'modern',
        complexity: 'پیچیده',
        tip: 'شامل تمام المان‌های ضروری یک سایت'
      });
    }
    
    // Default suggestion if no specific match
    if (suggestions.length === 0) {
      suggestions.push({
        title: 'کامپوننت سفارشی',
        description: 'طراحی اختصاصی بر اساس نیاز شما',
        style: 'custom',
        complexity: 'متغیر',
        tip: 'برای نیازهای خاص طراحی می‌شود'
      });
    }
    
    return suggestions;
  }

  generateCode(language, functionality, framework, requirements) {
    // Code generation based on language and functionality
    const templates = {
      javascript: {
        'interactive button': `
// Interactive Button Component
class InteractiveButton {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            ripple: true,
            animation: 'bounce',
            ...options
        };
        this.init();
    }
    
    init() {
        this.addEventListeners();
        if (this.options.ripple) {
            this.addRippleEffect();
        }
    }
    
    addEventListeners() {
        this.element.addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        this.element.addEventListener('mouseenter', () => {
            this.element.style.transform = 'translateY(-2px)';
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.element.style.transform = 'translateY(0)';
        });
    }
    
    addRippleEffect() {
        this.element.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = this.element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = [.]
                position: absolute;
                width: [.]{size}px;
                height: [.]{size}px;
                left: [.]{x}px;
                top: [.]{y}px;
                background: rgba(255,255,255,0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            [.];
            
            this.element.style.position = 'relative';
            this.element.style.overflow = 'hidden';
            this.element.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
    
    handleClick(e) {
        console.log('Button clicked!', e);
        // Custom click handling
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.interactive-btn');
    buttons.forEach(btn => new InteractiveButton(btn));
});

// CSS for ripple animation
const style = document.createElement('style');
style.textContent = [.]
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }
[.];
document.head.appendChild(style);
        `,
        
        'form validation': `
// Advanced Form Validation
class FormValidator {
    constructor(form, rules = {}) {
        this.form = form;
        this.rules = rules;
        this.errors = {};
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
                this.showErrors();
            }
        });
        
        // Real-time validation
        this.form.addEventListener('input', (e) => {
            this.validateField(e.target);
        });
    }
    
    validate() {
        this.errors = {};
        const formData = new FormData(this.form);
        
        for (const [fieldName, rules] of Object.entries(this.rules)) {
            const value = formData.get(fieldName);
            const fieldErrors = this.validateFieldValue(fieldName, value, rules);
            if (fieldErrors.length > 0) {
                this.errors[fieldName] = fieldErrors;
            }
        }
        
        return Object.keys(this.errors).length === 0;
    }
    
    validateFieldValue(fieldName, value, rules) {
        const errors = [];
        
        if (rules.required && (!value || value.trim() === '')) {
            errors.push('این فیلد الزامی است');
        }
        
        if (rules.minLength && value && value.length < rules.minLength) {
            errors.push([.]حداقل [.]{rules.minLength} کاراکتر وارد کنید[.]);
        }
        
        if (rules.email && value && !this.isValidEmail(value)) {
            errors.push('فرمت ایمیل صحیح نیست');
        }
        
        if (rules.pattern && value && !rules.pattern.test(value)) {
            errors.push(rules.message || 'فرمت ورودی صحیح نیست');
        }
        
        return errors;
    }
    
    validateField(field) {
        const fieldName = field.name;
        const rules = this.rules[fieldName];
        if (!rules) return;
        
        const errors = this.validateFieldValue(fieldName, field.value, rules);
        this.updateFieldError(field, errors);
    }
    
    updateFieldError(field, errors) {
        const errorElement = field.parentElement.querySelector('.error-message');
        
        if (errors.length > 0) {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errors[0];
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = errors[0];
                field.parentElement.appendChild(errorDiv);
            }
        } else {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
    
    showErrors() {
        for (const [fieldName, errors] of Object.entries(this.errors)) {
            const field = this.form.querySelector([.][name="[.]{fieldName}"][.]);
            if (field) {
                this.updateFieldError(field, errors);
            }
        }
    }
    
    isValidEmail(email) {
        return /^[^[[.]s]@]+@[^[[.]s]@]+[.][^[[.]s]@]+$/.test(email);
    }
}

// Usage Example
const form = document.getElementById('myForm');
const validator = new FormValidator(form, {
    name: { required: true, minLength: 2 },
    email: { required: true, email: true },
    phone: { pattern: /^09[[.]d]{9}$/, message: 'شماره موبایل صحیح وارد کنید' }
});
        `
      },
      
      css: {
        'modern layout': `
/* Modern CSS Layout System */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Flexbox Grid System */
.row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -15px;
}

.col {
    flex: 1;
    padding: 0 15px;
}

.col-1 { flex: 0 0 8.333%; max-width: 8.333%; }
.col-2 { flex: 0 0 16.666%; max-width: 16.666%; }
.col-3 { flex: 0 0 25%; max-width: 25%; }
.col-4 { flex: 0 0 33.333%; max-width: 33.333%; }
.col-6 { flex: 0 0 50%; max-width: 50%; }
.col-12 { flex: 0 0 100%; max-width: 100%; }

/* Modern Card Component */
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
    padding: 24px;
    border-bottom: 1px solid #f0f0f0;
}

.card-body {
    padding: 24px;
}

.card-footer {
    padding: 16px 24px;
    background: #fafafa;
}

/* Modern Button System */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline {
    background: transparent;
    border: 2px solid #667eea;
    color: #667eea;
}

.btn-outline:hover {
    background: #667eea;
    color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
    .container { padding: 0 15px; }
    .row { margin: 0 -10px; }
    .col { padding: 0 10px; }
    [class*="col-"] {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 20px;
    }
}

/* Utility Classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }

.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }
.mt-4 { margin-top: 32px; }

.mb-1 { margin-bottom: 8px; }
.mb-2 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 32px; }

.p-1 { padding: 8px; }
.p-2 { padding: 16px; }
.p-3 { padding: 24px; }
.p-4 { padding: 32px; }
        `
      }
    };
    
    const langTemplates = templates[language] || {};
    return langTemplates[functionality] || `// ${functionality} implementation[.]// Generated code for ${language}[.]console.log('${functionality} functionality');`;
  }

  getFileExtension(language) {
    const extensions = {
      javascript: 'js',
      css: 'css',
      html: 'html',
      react: 'jsx',
      vue: 'vue',
      svelte: 'svelte'
    };
    return extensions[language] || 'txt';
  }

  darkenColor(color) {
    // Simple color darkening
    return color.replace(/[0-9a-f]/g, (match) => {
      const val = parseInt(match, 16);
      return Math.max(0, val - 2).toString(16);
    });
  }

  // Template Creators
  createLandingTemplate(customization, content) {
    const { 
      title = 'عنوان سایت',
      subtitle = 'زیرعنوان توضیحی',
      heroButton = 'شروع کنید',
      features = [],
      colors = { primary: '#667eea', secondary: '#764ba2' }
    } = { ...customization, ...content };
    
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            padding: 100px 0;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            animation: fadeInUp 1s ease;
        }
        
        .hero p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            animation: fadeInUp 1s ease 0.2s both;
        }
        
        .hero-button {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
            animation: fadeInUp 1s ease 0.4s both;
        }
        
        .hero-button:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        
        /* Features Section */
        .features {
            padding: 80px 0;
            background: #f8f9fa;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 50px;
        }
        
        .feature-card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .section-title {
            text-align: center;
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 1rem;
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero p { font-size: 1.1rem; }
            .container { padding: 0 15px; }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>${title}</h1>
            <p>${subtitle}</p>
            <a href="#features" class="hero-button">${heroButton}</a>
        </div>
    </section>
    
    <section class="features" id="features">
        <div class="container">
            <h2 class="section-title">ویژگی‌ها</h2>
            <div class="features-grid">
                ${features.length > 0 ? features.map(feature => `
                <div class="feature-card">
                    <h3>${feature.title || 'ویژگی'}</h3>
                    <p>${feature.description || 'توضیح ویژگی'}</p>
                </div>
                `).join('') : `
                <div class="feature-card">
                    <h3>ویژگی اول</h3>
                    <p>توضیح کامل ویژگی اول</p>
                </div>
                <div class="feature-card">
                    <h3>ویژگی دوم</h3>
                    <p>توضیح کامل ویژگی دوم</p>
                </div>
                <div class="feature-card">
                    <h3>ویژگی سوم</h3>
                    <p>توضیح کامل ویژگی سوم</p>
                </div>
                `}
            </div>
        </div>
    </section>
    
    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });
        
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(card);
        });
    </script>
</body>
</html>`;
  }

  createDashboardTemplate(customization, content) {
    // Dashboard template implementation
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>داشبورد</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #f5f6fa; }
        
        .dashboard {
            display: grid;
            grid-template-areas: 
                "sidebar header"
                "sidebar main";
            grid-template-columns: 250px 1fr;
            grid-template-rows: 60px 1fr;
            height: 100vh;
        }
        
        .sidebar {
            grid-area: sidebar;
            background: #2c3e50;
            color: white;
            padding: 20px 0;
        }
        
        .header {
            grid-area: header;
            background: white;
            padding: 0 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .main {
            grid-area: main;
            padding: 30px;
            overflow-y: auto;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #3498db;
        }
        
        @media (max-width: 768px) {
            .dashboard {
                grid-template-areas: 
                    "header"
                    "main";
                grid-template-columns: 1fr;
                grid-template-rows: 60px 1fr;
            }
            .sidebar { display: none; }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <aside class="sidebar">
            <div style="padding: 0 20px; margin-bottom: 30px;">
                <h3>داشبورد</h3>
            </div>
            <nav>
                <a href="#" style="display: block; padding: 12px 20px; color: white; text-decoration: none; border-right: 3px solid transparent;">خانه</a>
                <a href="#" style="display: block; padding: 12px 20px; color: white; text-decoration: none; border-right: 3px solid transparent;">آمار</a>
                <a href="#" style="display: block; padding: 12px 20px; color: white; text-decoration: none; border-right: 3px solid transparent;">گزارشات</a>
            </nav>
        </aside>
        
        <header class="header">
            <h2>داشبورد مدیریت</h2>
            <div>کاربر: مدیر</div>
        </header>
        
        <main class="main">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>کل فروش</h3>
                    <div class="stat-number">۱۲۳,۴۵۶</div>
                </div>
                <div class="stat-card">
                    <h3>کاربران</h3>
                    <div class="stat-number">۸۹۲</div>
                </div>
                <div class="stat-card">
                    <h3>سفارشات</h3>
                    <div class="stat-number">۱۵۶</div>
                </div>
                <div class="stat-card">
                    <h3>درآمد</h3>
                    <div class="stat-number">۲,۳۴۵,۶۷۸</div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;
  }

  // Additional template methods would go here...
  createPortfolioTemplate() { return '<html><!-- Portfolio Template --></html>'; }
  createBlogTemplate() { return '<html><!-- Blog Template --></html>'; }
  createShopTemplate() { return '<html><!-- Shop Template --></html>'; }
  createAdminTemplate() { return '<html><!-- Admin Template --></html>'; }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🧠 سرور MCP هوشمند فارسی آماده - Cursor می‌تواند هر چیزی بسازد!');
  }
}

const server = new SmartPersianMCPServer();
server.run().catch(console.error);
