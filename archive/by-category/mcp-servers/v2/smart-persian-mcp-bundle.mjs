#!/usr/bin/env node
/**
 * Smart Persian MCP Bundle (Server + Embedded Cursor Config)
 * Version: 6.5.3
 * - Run as MCP server over stdio:           `node smart-persian-mcp-bundle.mjs`
 * - Print Cursor config to stdout (JSON):   `node smart-persian-mcp-bundle.mjs --print-config`
 * - Write Cursor config to file:            `node smart-persian-mcp-bundle.mjs --write-config`
 *
 * Notes:
 * - RTL/Persian auto-detect, Modern/Minimal/Glassmorphism styles
 * - All tools implemented: smart_create, quick_create, generate_template, build_component,
 *   smart_suggest, manage_preferences, optimize_code, get_analytics, natural_process
 * - Outputs => ./cursor-outputs ; Preferences/Analytics => ./cursor-memory
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

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ---- Embedded Cursor MCP Config (adjusts args to this very file) ----
const embeddedConfig = {
  "$schema": "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/mcp.json",
  "mcpServers": {
    "smart-persian-mcp": {
      "command": "node",
      "args": [ "./smart-persian-mcp-bundle.mjs" ],
      "env": {
        "MEMORY_PATH": "./cursor-memory",
        "OUTPUT_PATH": "./cursor-outputs"
      },
      "disabled": false,
      "autoApprove": [ "read_file", "list_tools", "call_tool" ]
    }
  }
};

class SmartPersianMCPServer {
  constructor() {
    this.server = new Server(
      { name: 'smart-persian-mcp-server', version: '6.5.3' },
      { capabilities: { tools: {} } }
    );

    // Paths
    this.memoryPath = process.env.MEMORY_PATH || path.join(process.cwd(), 'cursor-memory');
    this.outputPath = process.env.OUTPUT_PATH || path.join(process.cwd(), 'cursor-outputs');
    this.preferencesFile = path.join(this.memoryPath, 'cursor-preferences.json');
    this.usageStatsFile  = path.join(this.memoryPath, 'usage-stats.json');
    this.conversationMemoryFile = path.join(this.memoryPath, 'conversation-memory.json');

    // Language detection
    this.languagePatterns = {
      persian: /[\u0600-\u06FF\u200C\u200D]/,
      english: /[A-Za-z]/,
    };

    // Keyword maps
    this.smartKeywords = {
      types: {
        'دکمه':'button','button':'button','btn':'button',
        'کارت':'card','card':'card','باکس':'card',
        'فرم':'form','form':'form','تماس':'form',
        'هدر':'header','header':'header','سربرگ':'header',
        'صفحه':'page','page':'page','وب‌سایت':'page','landing':'page'
      },
      styles: {
        'مدرن':'modern','modern':'modern',
        'ساده':'minimal','minimal':'minimal','simple':'minimal',
        'شیشه‌ای':'glassmorphism','glassmorphism':'glassmorphism','glass':'glassmorphism'
      },
      colors: {
        'آبی':'#3498db','blue':'#3498db',
        'قرمز':'#e74c3c','red':'#e74c3c',
        'سبز':'#2ecc71','green':'#2ecc71',
        'بنفش':'#9b59b6','purple':'#9b59b6',
        'نارنجی':'#f39c12','orange':'#f39c12',
        'زرد':'#f1c40f','yellow':'#f1c40f'
      }
    };

    this.ensureDirectories();
    this.loadUserPreferences();
    this.loadConversationMemory();
    this.loadTemplates();
    this.setupToolHandlers();
  }

  // ---------- Infra ----------
  ensureDirectories() {
    [this.memoryPath, this.outputPath].forEach(d=>{
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });
  }
  log(message, level='info') {
    const t = new Date().toISOString();
    console.error(`[${t}] [${level.toUpperCase()}] ${message}`);
  }

  detectLanguage(text='') {
    if (!text) return 'english';
    return this.languagePatterns.persian.test(text) ? 'persian' : 'english';
  }

  loadUserPreferences() {
    try {
      this.userPreferences = fs.existsSync(this.preferencesFile)
        ? JSON.parse(fs.readFileSync(this.preferencesFile,'utf8'))
        : {
            colors: { primary:'#667eea', secondary:'#764ba2', accent:'#e74c3c' },
            styles: ['modern'],
            preferredLanguage: 'auto',
            responsiveDefault: true
          };
      fs.writeFileSync(this.preferencesFile, JSON.stringify(this.userPreferences,null,2));
    } catch {
      this.userPreferences = { colors:{ primary:'#667eea', secondary:'#764ba2' }, styles:['modern'] };
    }
  }

  loadConversationMemory() {
    try {
      this.conversationMemory = fs.existsSync(this.conversationMemoryFile)
        ? JSON.parse(fs.readFileSync(this.conversationMemoryFile,'utf8'))
        : { recentRequests: [], patterns:{} };
    } catch {
      this.conversationMemory = { recentRequests: [], patterns:{} };
    }
  }

  saveConversationMemory(request, result) {
    try {
      this.conversationMemory.recentRequests.unshift({
        request, result, timestamp:new Date().toISOString()
      });
      this.conversationMemory.recentRequests = this.conversationMemory.recentRequests.slice(0,50);
      fs.writeFileSync(this.conversationMemoryFile, JSON.stringify(this.conversationMemory,null,2));
    } catch {}
  }

  saveUsageStats(tool, ok, ms) {
    let stats = {};
    try {
      stats = fs.existsSync(this.usageStatsFile)
        ? JSON.parse(fs.readFileSync(this.usageStatsFile,'utf8'))
        : {};
    } catch {}
    stats[tool] ||= { calls:0, errors:0, avgMs:0, lastUsed:null };
    const s = stats[tool];
    s.calls += 1;
    if (!ok) s.errors += 1;
    s.avgMs = Math.round(((s.avgMs*(s.calls-1))+ms)/s.calls);
    s.lastUsed = new Date().toISOString();
    try { fs.writeFileSync(this.usageStatsFile, JSON.stringify(stats,null,2)); } catch {}
  }

  // ---------- Styles/Templates ----------
  loadTemplates() {
    this.templates = {
      css: {
        modern: `
          :root { --primary:#667eea; --secondary:#764ba2; --accent:#e74c3c; --gray-100:#f8f9fa; --radius:10px; --t: .3s ease }
          *{box-sizing:border-box} body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial;background:var(--gray-100);color:#222}
          .container{max-width:1100px;margin:0 auto;padding:24px}
          .card{background:#fff;border:1px solid #eaeaea;border-radius:var(--radius);padding:20px;box-shadow:0 4px 20px rgba(0,0,0,.06)}
          .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 18px;border-radius:12px;border:none;cursor:pointer;color:#fff;
               background:linear-gradient(135deg,var(--primary),var(--secondary));transition:transform var(--t), box-shadow var(--t);text-decoration:none}
          .btn:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(102,126,234,.35)}
          .form-group{margin-bottom:14px} .form-control{width:100%;padding:12px;border:2px solid #e8e8e8;border-radius:10px}
          .form-control:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(102,126,234,.15)}
          .grid{display:grid;gap:16px} .grid-2{grid-template-columns:repeat(2,minmax(0,1fr))} .grid-3{grid-template-columns:repeat(3,1fr)}
          .rtl{direction:rtl;text-align:right}
        `,
        minimal: `
          *{box-sizing:border-box} body{margin:0;font-family:system-ui,sans-serif;color:#333}
          .container{max-width:900px;margin:0 auto;padding:16px}
          .card{border:1px solid #eee;border-radius:8px;padding:16px;background:#fff}
          .btn{padding:10px 16px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer}
          .btn-primary{background:#0066cc;color:#fff;border-color:#0066cc}
          .form-group{margin-bottom:12px} .form-control{width:100%;padding:10px;border:1px solid #ddd;border-radius:6px}
          .rtl{direction:rtl;text-align:right}
        `,
        glassmorphism: `
          *{box-sizing:border-box} body{margin:0;min-height:100vh;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-family:system-ui}
          .container{max-width:1100px;margin:0 auto;padding:24px}
          .glass{background:rgba(255,255,255,.18);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:20px}
          .btn{background:rgba(255,255,255,.22);color:#fff;border:1px solid rgba(255,255,255,.35);padding:12px 18px;border-radius:999px;cursor:pointer}
          .form-control{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:10px;color:#fff;padding:12px;width:100%}
          .rtl{direction:rtl;text-align:right}
        `,
      }
    };
  }

  // ---------- Utils for creation ----------
  getBestStyleForContent(type, content={}) {
    const s = (this.userPreferences?.styles?.[0]) || 'modern';
    const txt = JSON.stringify(content).toLowerCase();
    if (txt.includes('glass') || txt.includes('شیشه')) return 'glassmorphism';
    if (txt.includes('minimal') || txt.includes('ساده')) return 'minimal';
    return s;
  }
  applySmartDefaults(content={}, language='english', type='component') {
    const isRTL = language==='persian';
    const c = { ...content };
    // Colors
    c.color1 ||= this.userPreferences?.colors?.primary || '#667eea';
    c.color2 ||= this.userPreferences?.colors?.secondary || '#764ba2';
    // Texts
    const defaultsFA = { button:'دکمه', cardTitle:'کارت', form:'فرم', header:'سربرگ', page:'صفحه' };
    const defaultsEN = { button:'Button', cardTitle:'Card', form:'Form', header:'Header', page:'Page' };
    const d = isRTL ? defaultsFA : defaultsEN;
    if (type==='button') c.text ||= d.button;
    if (type==='card')   c.title ||= d.cardTitle;
    if (type==='form')   c.title ||= d.form;
    if (type==='header') c.title ||= d.header;
    if (type==='page')   c.title ||= d.page;
    return c;
  }
  getSizePadding(size){ return size==='large'?'16px 26px': size==='small'?'8px 14px':'12px 20px';}
  getSizeFont(size){ return size==='large'?'18px': size==='small'?'14px':'16px';}
  optimizeHTML(html='', responsive=true) {
    let out = html;
    if (responsive && !out.includes('viewport')) {
      out = out.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">');
    }
    out = out.replace(/\/\*[\s\S]*?\*\//g,'').replace(/[ \t]{2,}/g,' ').replace(/\n{3,}/g,'\n\n');
    return out;
  }
  writeOutput(kind, html) {
    const name = `${kind}-${Date.now()}.html`;
    const p = path.join(this.outputPath, name);
    fs.writeFileSync(p, html, 'utf8');
    return { name, path: p };
  }

  // ---------- Component creators ----------
  pageShell({ lang, dir, title, css, body }) {
    return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>${css}</style>
</head>
<body class="${dir==='rtl'?'rtl':''}">
  <div class="container">${body}</div>
</body>
</html>`;
  }

  createButton(content, style, isRTL) {
    const size = content.size || 'medium';
    const btn = `<button class="btn" aria-label="${content.text}" style="padding:${this.getSizePadding(size)};font-size:${this.getSizeFont(size)};
      background:linear-gradient(135deg, ${content.color1}, ${content.color2})">${content.icon?`<i class="${content.icon}"></i>`:''}${content.text||''}</button>`;
    const body = `<div class="card" style="text-align:center">${btn}</div>`;
    return this.pageShell({
      lang: isRTL?'fa':'en', dir: isRTL?'rtl':'ltr',
      title: isRTL?'دکمه هوشمند':'Smart Button',
      css: this.templates.css[style] || this.templates.css.modern, body
    });
  }

  createCard(content, style, isRTL) {
    const body = `<div class="card" role="region" aria-label="${content.title}">
      ${content.image?`<img src="${content.image}" alt="${content.title}" style="width:100%;border-radius:10px;margin-bottom:12px">`:''}
      <h2 style="margin:0 0 10px">${content.title}</h2>
      <p>${content.content || (isRTL?'محتوا اینجاست.':'Content goes here.')}</p>
      ${content.buttonText ? `<a class="btn" href="#">${content.buttonText}</a>` : ''}
    </div>`;
    return this.pageShell({
      lang: isRTL?'fa':'en', dir: isRTL?'rtl':'ltr',
      title: content.title, css: this.templates.css[style] || this.templates.css.modern, body
    });
  }

  createForm(content, style, isRTL) {
    const fields = Array.isArray(content.fields)&&content.fields.length ? content.fields : [
      { name:'name',  label:isRTL?'نام':'Name',   type:'text',     required:true },
      { name:'email', label:isRTL?'ایمیل':'Email', type:'email',   required:true },
      { name:'message', label:isRTL?'پیام':'Message', type:'textarea', required:true },
    ];
    const items = fields.map(f=>{
      if (f.type==='textarea') return `<div class="form-group">
        <label for="${f.name}">${f.label}${f.required?' *':''}</label>
        <textarea id="${f.name}" class="form-control" rows="4" ${f.required?'required':''} aria-label="${f.label}"></textarea>
      </div>`;
      return `<div class="form-group">
        <label for="${f.name}">${f.label}${f.required?' *':''}</label>
        <input id="${f.name}" class="form-control" type="${f.type||'text'}" ${f.required?'required':''} aria-label="${f.label}">
      </div>`;
    }).join('');
    const body = `<div class="card glass">
      <h2 style="margin:0 0 12px">${content.title}</h2>
      <form>${items}<button class="btn" type="submit">${isRTL?'ارسال':'Submit'}</button></form>
    </div>`;
    return this.pageShell({
      lang: isRTL?'fa':'en', dir: isRTL?'rtl':'ltr',
      title: content.title, css: this.templates.css[style] || this.templates.css.modern, body
    });
  }

  createHeader(content, style, isRTL) {
    const nav = Array.isArray(content.navigation)&&content.navigation.length ? content.navigation : (
      isRTL
        ? [{text:'خانه',url:'#'},{text:'خدمات',url:'#'},{text:'تماس',url:'#'}]
        : [{text:'Home',url:'#'},{text:'Services',url:'#'},{text:'Contact',url:'#'}]
    );
    const items = nav.map(n=>`<a class="btn" href="${n.url}">${n.text}</a>`).join(' ');
    const body = `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <strong>${content.title}</strong><nav aria-label="${isRTL?'منو':'Navigation'}">${items}</nav></div>`;
    return this.pageShell({
      lang: isRTL?'fa':'en', dir: isRTL?'rtl':'ltr',
      title: content.title, css: this.templates.css[style] || this.templates.css.modern, body
    });
  }

  createPage(content, style, isRTL) {
    const sections = Array.isArray(content.sections)&&content.sections.length ? content.sections : [
      { type:'hero',    title:content.title, subtitle:isRTL?'خوش آمدید':'Welcome' },
      { type:'content', title:isRTL?'درباره ما':'About Us', content:isRTL?'محتوای نمونه':'Sample content' },
    ];
    const parts = sections.map(s=>{
      if (s.type==='hero') return `<section class="card" style="text-align:center;background:linear-gradient(135deg, ${content.color1}, ${content.color2});color:#fff">
        <h1 style="margin:0 0 10px">${s.title}</h1><p>${s.subtitle||''}</p></section>`;
      if (s.type==='grid' && Array.isArray(s.items)) {
        const grid = s.cols===3?'grid grid-3':'grid grid-2';
        const items = s.items.map(it=>`<div class="card"><h3>${it.title||''}</h3><p>${it.content||''}</p></div>`).join('');
        return `<section class="${grid}">${items}</section>`;
      }
      return `<section class="card"><h2>${s.title||''}</h2><p>${s.content||''}</p></section>`;
    }).join('');
    return this.pageShell({
      lang: isRTL?'fa':'en', dir: isRTL?'rtl':'ltr',
      title: content.title, css: this.templates.css[style] || this.templates.css.modern, body: parts
    });
  }

  // ---------- Template generators ----------
  generateTemplate(template, industry, customization={}, language='auto', style='auto') {
    const lang = language==='auto' ? (this.detectLanguage(JSON.stringify(customization))): language;
    const isRTL = lang==='persian';
    const st = style==='auto' ? this.getBestStyleForContent('page', customization) : style;

    const brand = {
      name: customization.companyName || (isRTL?'رویـا':'Dreammaker'),
      color1: customization.primaryColor || this.userPreferences?.colors?.primary || '#667eea',
      color2: customization.secondaryColor || this.userPreferences?.colors?.secondary || '#764ba2',
      logo: customization.logo || '',
    };

    if (template==='landing') {
      const content = {
        title: brand.name,
        color1: brand.color1,
        color2: brand.color2,
        sections: [
          { type:'hero', title: brand.name, subtitle: isRTL?'به وب‌سایت ما خوش آمدید':'Welcome to our website' },
          { type:'grid', cols:3, items: (customization.features||[
            { title: isRTL?'سریع':'Fast', content: isRTL?'عملکرد سریع و سبک':'Fast and lightweight' },
            { title: isRTL?'ایمن':'Secure', content: isRTL?'امنیت و اطمینان بالا':'High security & reliability' },
            { title: isRTL?'واکنشگرا':'Responsive', content: isRTL?'سازگار با همه دستگاه‌ها':'Works on all devices' },
          ])},
          { type:'content', title: isRTL?'تماس با ما':'Contact', content: customization?.contactInfo?.email
              ? `${isRTL?'ایمیل':'Email'}: ${customization.contactInfo.email}` : (isRTL?'در تماس باشید':'Get in touch') }
        ]
      };
      return this.createPage(content, st, isRTL);
    }

    if (template==='dashboard') {
      const body = `
        <section class="grid grid-3">
          <div class="card"><h3>${isRTL?'کاربران':'Users'}</h3><p>1,240</p></div>
          <div class="card"><h3>${isRTL?'سفارشات':'Orders'}</h3><p>312</p></div>
          <div class="card"><h3>${isRTL?'درآمد':'Revenue'}</h3><p>$12,430</p></div>
        </section>
        <section class="grid grid-2" style="margin-top:16px">
          <div class="card"><h3>${isRTL?'نمودار A':'Chart A'}</h3><p>${isRTL?'(فضای نمودار)':'(chart placeholder)'}</p></div>
          <div class="card"><h3>${isRTL?'نمودار B':'Chart B'}</h3><p>${isRTL?'(فضای نمودار)':'(chart placeholder)'}</p></div>
        </section>`;
      return this.pageShell({
        lang: isRTL?'fa':'en', dir:isRTL?'rtl':'ltr',
        title: brand.name+' Dashboard', css:this.templates.css[st], body
      });
    }

    if (template==='portfolio') {
      const items = (customization.features||[{title:'Project A'},{title:'Project B'},{title:'Project C'}])
        .map(f=>`<div class="card"><h3>${f.title}</h3><p>${f.desc||''}</p></div>`).join('');
      const body = `<section class="card" style="text-align:center;background:linear-gradient(135deg,${brand.color1},${brand.color2});color:#fff">
        <h1>${brand.name}</h1><p>${isRTL?'نمونه‌کارها':'Portfolio'}</p></section><section class="grid grid-3">${items}</section>`;
      return this.pageShell({ lang:isRTL?'fa':'en', dir:isRTL?'rtl':'ltr', title:`${brand.name} | Portfolio`, css:this.templates.css[st], body });
    }

    if (template==='blog') {
      const posts = (customization.features||[{title:'Post 1'},{title:'Post 2'},{title:'Post 3'}])
        .map(p=>`<article class="card"><h3>${p.title}</h3><p>${p.excerpt||''}</p></article>`).join('');
      const body = `<header class="card"><h1>${brand.name} ${isRTL?'بلاگ':'Blog'}</h1></header><main class="grid grid-3">${posts}</main>`;
      return this.pageShell({ lang:isRTL?'fa':'en', dir:isRTL?'rtl':'ltr', title:`${brand.name} Blog`, css:this.templates.css[st], body });
    }

    if (template==='ecommerce') {
      const prods = (customization.features||[
        {title:isRTL?'محصول ۱':'Product 1', price:'$19'},
        {title:isRTL?'محصول ۲':'Product 2', price:'$29'},
        {title:isRTL?'محصول ۳':'Product 3', price:'$39'},
      ]).map(p=>`<div class="card"><h3>${p.title}</h3><p>${p.price||''}</p><a class="btn" href="#">${isRTL?'افزودن به سبد':'Add to cart'}</a></div>`).join('');
      const body = `<section class="card" style="text-align:center;background:linear-gradient(135deg,${brand.color1},${brand.color2});color:#fff">
        <h1>${brand.name}</h1><p>${isRTL?'فروشگاه آنلاین':'Online Store'}</p></section><section class="grid grid-3">${prods}</section>`;
      return this.pageShell({ lang:isRTL?'fa':'en', dir:isRTL?'rtl':'ltr', title:`${brand.name} Shop`, css:this.templates.css[st], body });
    }

    return this.createPage({ title: brand.name }, st, isRTL);
  }

  // ---------- Build Component (compositor) ----------
  buildComponent(components=[], layout='flex', theme={}, language='auto', responsive=true) {
    const lang = language==='auto' ? this.detectLanguage(JSON.stringify(components)) : language;
    const isRTL = lang==='persian';
    const st = theme?.style || (this.userPreferences?.styles?.[0] || 'modern');
    const css = this.templates.css[st] || this.templates.css.modern;

    const themed = (html)=>html.replaceAll('var(--primary)', theme.primary||'var(--primary)')
                               .replaceAll('var(--secondary)', theme.secondary||'var(--secondary)');

    const blocks = components.map(c=>{
      const t = c.type;
      const ct = this.applySmartDefaults(c.content||{}, lang, t);
      const extract = (html)=> {
        const m = html.match(/<div class="container">([\s\S]*)<\/div>/);
        return m ? m[1] : html;
      };
      if (t==='button') return extract(this.createButton(ct, st, isRTL));
      if (t==='card')   return extract(this.createCard(ct, st, isRTL));
      if (t==='form')   return extract(this.createForm(ct, st, isRTL));
      if (t==='header') return extract(this.createHeader(ct, st, isRTL));
      if (t==='page')   return extract(this.createPage(ct, st, isRTL));
      return `<div class="card"><pre>${JSON.stringify(ct,null,2)}</pre></div>`;
    }).join('\n');

    let wrapper = blocks;
    if (layout==='grid') wrapper = `<section class="grid grid-3">${blocks}</section>`;
    if (layout==='stack') wrapper = `<section class="grid">${blocks}</section>`;
    if (layout==='sidebar') wrapper = `<section class="grid grid-2"><div>${blocks}</div><aside class="card">${isRTL?'نوار کناری':'Sidebar'}</aside></section>`;
    if (layout==='hero') wrapper = `<section class="card" style="text-align:center;background:linear-gradient(135deg, var(--primary), var(--secondary));color:#fff">${blocks}</section>`;

    const html = this.pageShell({
      lang: isRTL?'fa':'en', dir: isRTL?'rtl':'ltr',
      title: isRTL?'کامپوننت ترکیبی':'Composite Component',
      css, body: wrapper
    });

    return this.optimizeHTML(themed(html), responsive);
  }

  // ---------- Smart Suggest ----------
  smartSuggest(need, context='website', budget='medium', audience='general', language='auto') {
    const lang = language==='auto' ? this.detectLanguage(need) : language;
    const isRTL = lang==='persian';
    const lines = [];
    const t = (fa,en)=> isRTL?fa:en;
    lines.push(t('✅ آنچه نیاز دارید:','✅ Your need:') + ' ' + need);
    lines.push(t('🎯 زمینه:','🎯 Context:') + ' ' + context);
    lines.push(t('⏱️ پیچیدگی/زمان:','⏱️ Complexity/Time:') + ' ' + budget);
    lines.push(t('👥 مخاطب:','👥 Audience:') + ' ' + audience);

    const suggestions = [];
    if (context==='dashboard') {
      suggestions.push(t('صفحه داشبورد با سه کارت KPI و دو چارت.','A dashboard landing with three KPI cards and two charts.'));
      suggestions.push(t('ناوبری ثابت بالا + سایدبار اختیاری.','Sticky top nav + optional sidebar.'));
    } else if (context==='ecommerce') {
      suggestions.push(t('شبکه محصولات ۳ ستونه + کارت محصول با دکمه خرید.','3-col product grid + product card with CTA.'));
      suggestions.push(t('هدر با جستجو و سبد خرید.','Header with search and cart.'));
    } else {
      suggestions.push(t('بخش هیرو با عنوان و CTA.','Hero section with title and CTA.'));
      suggestions.push(t('سه کارت ویژگی + بخش تماس.','Three feature cards + contact section.'));
    }
    if (budget==='simple' || budget==='minimal') suggestions.push(t('استفاده از سبک مینیمال و حذف انیمیشن‌های سنگین.','Use minimal style and avoid heavy animations.'));
    if (budget==='complex') suggestions.push(t('افزودن انیمیشن‌های ظریف و گرادیانت شیشه‌ای.','Add subtle animations and glass gradients.'));

    return lines.concat(['', t('پیشنهادها:','Suggestions:')]).concat(suggestions).join('\n');
  }

  // ---------- Optimize Code ----------
  optimizeCode(filePath, optimizations=[], target='modern') {
    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
    let data = fs.readFileSync(filePath,'utf8');
    const beforeSize = Buffer.byteLength(data,'utf8');

    const apply = (name, fn)=>{ if (optimizations.includes(name)) data = fn(data); };

    apply('minify', (s)=> s
      .replace(/>\s+</g,'><')
      .replace(/\/\*[\s\S]*?\*\//g,'')
      .replace(/[ \t]{2,}/g,' ')
      .replace(/\n{2,}/g,'\n'));

    apply('accessibility', (s)=> {
      if (!/lang="/.test(s)) s = s.replace('<html ', '<html lang="en" ');
      if (!/dir="/.test(s)) s = s.replace('<html ', '<html dir="ltr" ');
      s = s.replace(/<button(?![^>]*aria-label)/g, '<button aria-label="button"');
      return s;
    });

    apply('performance', (s)=>{
      if (!s.includes('rel="preconnect"')) {
        s = s.replace('<head>', '<head>\n  <link rel="preconnect" href="https://fonts.googleapis.com">');
      }
      return s;
    });

    apply('mobile-optimize', (s)=>{
      if (!s.includes('name="viewport"')) {
        s = s.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">');
      }
      return s;
    });

    apply('seo', (s)=>{
      if (!/<meta name="description"/.test(s)) {
        s = s.replace('<head>', '<head>\n  <meta name="description" content="Generated by Smart Persian MCP Server">');
      }
      return s;
    });

    apply('security', (s)=>{
      s = s.replace(/<a\s+([^>]*?)>/g, (m,attrs)=>{
        if (!/rel=/.test(attrs)) attrs += ' rel="noopener noreferrer"';
        if (!/referrerpolicy=/.test(attrs)) attrs += ' referrerpolicy="no-referrer"';
        return `<a ${attrs}>`;
      });
      return s;
    });

    fs.writeFileSync(filePath, data, 'utf8');
    const afterSize = Buffer.byteLength(data,'utf8');
    return { beforeSize, afterSize, bytesSaved: beforeSize-afterSize, path: filePath };
  }

  // ---------- Analytics ----------
  getAnalytics(period='week', details=false, focus) {
    let stats = {};
    try { stats = fs.existsSync(this.usageStatsFile) ? JSON.parse(fs.readFileSync(this.usageStatsFile,'utf8')) : {}; } catch {}
    const arr = Object.entries(stats).map(([tool, s])=>({ tool, ...s }));
    const totalCalls = arr.reduce((a,c)=>a + (c.calls||c.count||0), 0);
    const errors     = arr.reduce((a,c)=>a + (c.errors||0),0);
    const avgMs      = arr.length ? Math.round(arr.reduce((a,c)=>a + (c.avgMs||c.avgTime||0),0)/arr.length) : 0;

    const header = `Analytics (${period}) – tools: ${arr.length}, totalCalls: ${totalCalls}, errors: ${errors}, avgMs: ${avgMs}`;
    if (!details) return header;
    const lines = arr
      .filter(x=>!focus || (focus && x[focus]!==undefined))
      .map(x=>`- ${x.tool}: calls=${x.calls||x.count||0}, errors=${x.errors||0}, avgMs=${x.avgMs||x.avgTime||0}, lastUsed=${x.lastUsed||'-'}`);
    return [header, ...lines].join('\n');
  }

  // ---------- Natural Process ----------
  naturalProcess(description, context, examples=[]) {
    const lang = this.detectLanguage(description);
    const isRTL = lang==='persian';
    const desc = description.toLowerCase();

    let type = 'button';
    if (/(form|فرم|contact|تماس|ثبت[\s-]?نام|login|ورود)/i.test(desc)) type = 'form';
    else if (/(card|کارت|box|جعبه|panel|پنل)/i.test(desc)) type = 'card';
    else if (/(header|هدر|navbar|منو|سربرگ)/i.test(desc)) type = 'header';
    else if (/(page|صفحه|landing|homepage|خانه)/i.test(desc)) type = 'page';

    const quoted = description.match(/"([^"]+)"|'([^']+)'|«([^»]+)»/);
    const text = quoted ? (quoted[1]||quoted[2]||quoted[3]) : (isRTL?'دکمه':'Button');

    let color1;
    for (const [k,v] of Object.entries(this.smartKeywords.colors)) if (desc.includes(k)) { color1=v; break; }

    let size='medium';
    if (/(large|بزرگ|huge|عظیم)/i.test(desc)) size='large';
    else if (/(small|کوچک|ریز)/i.test(desc)) size='small';

    let suggestedStyle='modern';
    for (const [k,st] of Object.entries(this.smartKeywords.styles)) if (desc.includes(k)) { suggestedStyle=st; break; }

    const content = { text, size, ...(color1?{color1}:{}) };
    return { type, language: lang, suggestedStyle, content, context, examples };
  }

  // ---------- Preferences ----------
  managePreferences({ action, category, data, context }) {
    if (action==='load') {
      return this.userPreferences;
    }
    if (action==='reset') {
      this.userPreferences = {
        colors:{ primary:'#667eea', secondary:'#764ba2', accent:'#e74c3c' },
        styles:['modern'],
        preferredLanguage:'auto',
        responsiveDefault:true
      };
      fs.writeFileSync(this.preferencesFile, JSON.stringify(this.userPreferences,null,2));
      return this.userPreferences;
    }
    if (action==='save' || action==='update') {
      if (data && typeof data==='object') {
        if (category) {
          this.userPreferences[category] = { ...(this.userPreferences[category]||{}), ...data };
        } else {
          this.userPreferences = { ...this.userPreferences, ...data };
        }
        fs.writeFileSync(this.preferencesFile, JSON.stringify(this.userPreferences,null,2));
      }
      return this.userPreferences;
    }
    if (action==='export') {
      const exportPath = path.join(this.memoryPath, `preferences-${Date.now()}.json`);
      fs.writeFileSync(exportPath, JSON.stringify(this.userPreferences,null,2));
      return { exported: true, path: exportPath };
    }
    return this.userPreferences;
  }

  // ---------- Tool Handlers & MCP wiring ----------
  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'smart_create',
          description: 'Create web elements (button, card, form, header, page) with smart defaults and FA/RTL.',
          inputSchema: {
            type:'object',
            properties:{
              type:{ type:'string', enum:['button','card','form','header','page'] },
              content:{ type:'object' },
              style:{ type:'string', enum:['auto','modern','minimal','glassmorphism'], default:'auto' },
              language:{ type:'string', enum:['auto','persian','english'], default:'auto' },
              responsive:{ type:'boolean', default:true }
            },
            required:['type','content']
          }
        },
        {
          name: 'quick_create',
          description: 'Describe what you want (e.g., "دکمه آبی بزرگ") and get a generated element.',
          inputSchema: {
            type:'object',
            properties:{
              description:{ type:'string' },
              style:{ type:'string', enum:['auto','modern','minimal','glassmorphism'], default:'auto' }
            },
            required:['description']
          }
        },
        {
          name: 'generate_template',
          description: 'Generate full page templates (landing, dashboard, portfolio, blog, ecommerce).',
          inputSchema: {
            type:'object',
            properties:{
              template:{ type:'string', enum:['landing','dashboard','portfolio','blog','ecommerce'] },
              industry:{ type:'string', enum:['technology','healthcare','education','finance','restaurant','retail','agency','portfolio','nonprofit'] },
              customization:{ type:'object' },
              language:{ type:'string', enum:['auto','persian','english'], default:'auto' },
              style:{ type:'string', enum:['auto','modern','minimal','glassmorphism'], default:'auto' }
            },
            required:['template']
          }
        },
        {
          name: 'build_component',
          description: 'Compose multiple elements into one page with layout and theme.',
          inputSchema: {
            type:'object',
            properties:{
              components:{ type:'array', items:{
                type:'object',
                properties:{
                  type:{ type:'string', enum:['button','card','form','header','page'] },
                  content:{ type:'object' }
                }, required:['type','content']
              }},
              layout:{ type:'string', enum:['grid','flex','stack','sidebar','hero'], default:'flex' },
              theme:{ type:'object', properties:{
                primary:{type:'string'}, secondary:{type:'string'}, style:{type:'string', enum:['modern','minimal','glassmorphism']}
              }},
              language:{ type:'string', enum:['auto','persian','english'], default:'auto' },
              responsive:{ type:'boolean', default:true }
            },
            required:['components']
          }
        },
        {
          name: 'smart_suggest',
          description: 'Get intelligent UI suggestions based on need/context/budget/audience.',
          inputSchema: {
            type:'object',
            properties:{
              need:{ type:'string' },
              context:{ type:'string', enum:['website','app','dashboard','portfolio','business','personal','educational','ecommerce'], default:'website' },
              budget:{ type:'string', enum:['simple','medium','complex','minimal'], default:'medium' },
              audience:{ type:'string', enum:['general','business','technical','creative','youth','professional'], default:'general' },
              language:{ type:'string', enum:['auto','persian','english'], default:'auto' }
            },
            required:['need']
          }
        },
        {
          name: 'manage_preferences',
          description: 'Save, load, update, reset, or export preferences.',
          inputSchema: {
            type:'object',
            properties:{
              action:{ type:'string', enum:['save','load','update','reset','export'] },
              category:{ type:'string' },
              data:{ type:'object' },
              context:{ type:'string' }
            },
            required:['action']
          }
        },
        {
          name: 'optimize_code',
          description: 'Optimize an HTML file for minify, accessibility, seo, performance, mobile-optimize, security.',
          inputSchema: {
            type:'object',
            properties:{
              filePath:{ type:'string' },
              optimizations:{ type:'array', items:{ type:'string', enum:['minify','accessibility','seo','performance','mobile-optimize','security'] }, default:['mobile-optimize','accessibility'] },
              target:{ type:'string', enum:['modern','legacy','mobile','desktop'], default:'modern' }
            },
            required:['filePath']
          }
        },
        {
          name: 'get_analytics',
          description: 'Usage analytics (period: today/week/month/all).',
          inputSchema: {
            type:'object',
            properties:{
              period:{ type:'string', enum:['today','week','month','all'], default:'week' },
              details:{ type:'boolean', default:false },
              focus:{ type:'string', enum:['performance','usage','preferences','errors','suggestions'] }
            }
          }
        },
        {
          name: 'natural_process',
          description: 'Convert natural text to structured component spec.',
          inputSchema: {
            type:'object',
            properties:{
              description:{ type:'string' },
              context:{ type:'string' },
              examples:{ type:'array', items:{ type:'string' } }
            },
            required:['description']
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
          case 'smart_create': {
            const { type, content, style='auto', language='auto', responsive=true } = args||{};
            const detected = language==='auto' ? this.detectLanguage(JSON.stringify(content)) : language;
            const isRTL  = detected==='persian';
            const st     = style==='auto' ? this.getBestStyleForContent(type, content) : style;
            const cnt    = this.applySmartDefaults(content, detected, type);
            let html='';
            if (type==='button') html=this.createButton(cnt, st, isRTL);
            else if (type==='card') html=this.createCard(cnt, st, isRTL);
            else if (type==='form') html=this.createForm(cnt, st, isRTL);
            else if (type==='header') html=this.createHeader(cnt, st, isRTL);
            else if (type==='page') html=this.createPage(cnt, st, isRTL);
            else throw new Error(`Unsupported type: ${type}`);
            html = this.optimizeHTML(html, responsive);
            const f = this.writeOutput(type, html);
            result = { content:[{ type:'text', text: `${isRTL?`${type} ساخته شد`:`${type} created`}\nFile: ${f.name}\nPath: ${f.path}\nStyle: ${st}\nLang: ${detected}` }] };
            break;
          }
          case 'quick_create': {
            const { description='', style='auto' } = args||{};
            const spec = this.naturalProcess(description, 'website', []);
            const lang = spec.language;
            const st   = style==='auto' ? spec.suggestedStyle : style;
            result = await this.server.request({ method:'tools/call', params:{ name:'smart_create', arguments:{
              type: spec.type, content: spec.content, style: st, language: lang, responsive: true
            }}});
            break;
          }
          case 'generate_template': {
            const { template, industry='technology', customization={}, language='auto', style='auto' } = args||{};
            const html = this.generateTemplate(template, industry, customization, language, style);
            const f = this.writeOutput(`template-${template}`, this.optimizeHTML(html,true));
            result = { content:[{ type:'text', text:`Template "${template}" generated.\nFile: ${f.name}\nPath: ${f.path}` }] };
            break;
          }
          case 'build_component': {
            const { components=[], layout='flex', theme={}, language='auto', responsive=true } = args||{};
            const html = this.buildComponent(components, layout, theme, language, responsive);
            const f = this.writeOutput('composite', html);
            result = { content:[{ type:'text', text:`Composite built.\nFile: ${f.name}\nPath: ${f.path}` }] };
            break;
          }
          case 'smart_suggest': {
            const { need='', context='website', budget='medium', audience='general', language='auto' } = args||{};
            const txt = this.smartSuggest(need, context, budget, audience, language);
            result = { content:[{ type:'text', text: txt }] };
            break;
          }
          case 'manage_preferences': {
            const prefs = this.managePreferences(args||{ action:'load' });
            result = { content:[{ type:'text', text: `Preferences:\n${JSON.stringify(prefs,null,2)}` }] };
            break;
          }
          case 'optimize_code': {
            const { filePath, optimizations=['mobile-optimize','accessibility'], target='modern' } = args||{};
            const info = this.optimizeCode(filePath, optimizations, target);
            result = { content:[{ type:'text', text:`Optimized ${path.basename(filePath)}\nBefore: ${info.beforeSize} bytes\nAfter: ${info.afterSize} bytes\nSaved: ${info.bytesSaved} bytes` }] };
            break;
          }
          case 'get_analytics': {
            const { period='week', details=false, focus } = args||{};
            const txt = this.getAnalytics(period, details, focus);
            result = { content:[{ type:'text', text: txt }] };
            break;
          }
          case 'natural_process': {
            const { description, context, examples=[] } = args||{};
            const spec = this.naturalProcess(description, context, examples);
            result = { content:[{ type:'text', text: JSON.stringify(spec,null,2) }] };
            break;
          }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
        this.saveUsageStats(name, true, Date.now()-t0);
        this.saveConversationMemory(args, { success:true, tool:name });
        return result;
      } catch (error) {
        this.saveUsageStats(name, false, Date.now()-t0);
        this.saveConversationMemory(args, { success:false, tool:name, error:String(error?.message||error) });
        this.log(`Error in ${name}: ${error?.message||error}`, 'error');
        throw new McpError(ErrorCode.InternalError, `Error: ${error?.message||error}`);
      }
    });
  }

  async run() {
    const argv = process.argv.slice(2);
    if (argv.includes('--print-config')) {
      console.log(JSON.stringify(embeddedConfig, null, 2));
      return;
    }
    if (argv.includes('--write-config')) {
      const out = path.join(process.cwd(), 'complete-mcp-config.json');
      fs.writeFileSync(out, JSON.stringify(embeddedConfig, null, 2), 'utf8');
      console.error(`Wrote Cursor MCP config to: ${out}`);
      return;
    }

    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      this.log('Smart Persian MCP Server connected on stdio ✅');
    } catch (e) {
      this.log(`Failed to start server: ${e?.message||e}`, 'error');
      process.exit(1);
    }
  }
}

new SmartPersianMCPServer().run().catch(e=>{
  console.error('Server startup failed:', e);
  process.exit(1);
});
