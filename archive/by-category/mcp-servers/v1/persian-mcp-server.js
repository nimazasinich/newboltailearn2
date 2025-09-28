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

// سرور MCP فارسی کامل با ساب کامندها
class PersianMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'persian-mcp-server',
        version: '3.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // مسیرهای ذخیره‌سازی
    this.memoryPath = process.env.MEMORY_PATH || './cursor-memory';
    this.formsPath = process.env.FORMS_PATH || './generated-forms';
    
    // ایجاد پوشه‌ها در صورت عدم وجود
    this.ensureDirectories();
    
    this.setupToolHandlers();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.memoryPath)) {
      fs.mkdirSync(this.memoryPath, { recursive: true });
    }
    if (!fs.existsSync(this.formsPath)) {
      fs.mkdirSync(this.formsPath, { recursive: true });
    }
  }

  setupToolHandlers() {
    // لیست ابزارها
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'persian_memory_save',
            description: 'ذخیره اطلاعات در حافظه فارسی - استفاده: "در حافظت ذخیره کن [نوع]: [محتوا]"',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'محتوای مورد نظر برای ذخیره'
                },
                category: {
                  type: 'string',
                  description: 'نوع دسته‌بندی (notes, projects, ideas, tasks)'
                }
              },
              required: ['content']
            }
          },
          {
            name: 'persian_memory_recall',
            description: 'بازیابی اطلاعات از حافظه فارسی - استفاده: "یادت میاد [چیزی]؟"',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'کلمه کلیدی برای جستجو'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'persian_memory_list',
            description: 'نمایش لیست کامل حافظه - استفاده: "لیست چی تو حافظت هست"',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'persian_memory_forget',
            description: 'فراموش کردن یک مورد - استفاده: "فراموش کن [چیزی]"',
            inputSchema: {
              type: 'object',
              properties: {
                item: {
                  type: 'string',
                  description: 'مورد مورد نظر برای فراموش کردن'
                }
              },
              required: ['item']
            }
          },
          {
            name: 'persian_form_generator',
            description: 'ساخت فرم HTML فارسی - استفاده: "یه فرم [نوع] بساز"',
            inputSchema: {
              type: 'object',
              properties: {
                formType: {
                  type: 'string',
                  description: 'نوع فرم (contact, registration, survey, feedback)'
                },
                style: {
                  type: 'string',
                  description: 'سبک فرم (simple, advanced, modern, classic)'
                }
              },
              required: ['formType']
            }
          }
        ]
      };
    });

    // اجرای ابزارها
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'persian_memory_save':
            return await this.handleMemorySave(args.content, args.category);
          
          case 'persian_memory_recall':
            return await this.handleMemoryRecall(args.query);
          
          case 'persian_memory_list':
            return await this.handleMemoryList();
          
          case 'persian_memory_forget':
            return await this.handleMemoryForget(args.item);
          
          case 'persian_form_generator':
            return await this.handleFormGenerator(args.formType, args.style);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `ابزار ناشناخته: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `خطا در اجرای ${name}: ${error.message}`
        );
      }
    });
  }

  // ذخیره در حافظه با ساب کامند
  async handleMemorySave(content, category) {
    if (!category) {
      // نمایش گزینه‌های ساب کامند
      return {
        content: [
          {
            type: 'text',
            text: `🧠 انتخاب نوع ذخیره‌سازی برای: "${content}"\n\n` +
                  `1️⃣ یادداشت (notes) - برای یادداشت‌های کلی\n` +
                  `2️⃣ پروژه (projects) - برای ایده‌های پروژه\n` +
                  `3️⃣ ایده (ideas) - برای ایده‌های خلاقانه\n` +
                  `4️⃣ کار (tasks) - برای کارهای انجام دادنی\n\n` +
                  `لطفاً شماره گزینه مورد نظر را بگویید: "گزینه 1" یا "1"`
          }
        ]
      };
    }

    // تبدیل شماره به دسته‌بندی
    const categoryMap = {
      '1': 'notes',
      '2': 'projects', 
      '3': 'ideas',
      '4': 'tasks'
    };
    
    const finalCategory = categoryMap[category] || category;
    
    // ذخیره در فایل
    const filePath = path.join(this.memoryPath, `${finalCategory}.json`);
    let data = [];
    
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    const newItem = {
      id: Date.now(),
      content: content,
      timestamp: new Date().toISOString(),
      category: finalCategory
    };
    
    data.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ ذخیره شد در دسته "${finalCategory}": ${content}`
        }
      ]
    };
  }

  // بازیابی از حافظه
  async handleMemoryRecall(query) {
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
        content: [
          {
            type: 'text',
            text: `❌ چیزی با کلیدواژه "${query}" پیدا نشد`
          }
        ]
      };
    }
    
    const resultText = results.map(item => 
      `📝 ${item.category}: ${item.content} (${new Date(item.timestamp).toLocaleDateString('fa-IR')})`
    ).join('\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `🔍 نتایج جستجو برای "${query}":\n\n${resultText}`
        }
      ]
    };
  }

  // نمایش لیست کامل
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
        content: [
          {
            type: 'text',
            text: `📭 حافظه خالی است`
          }
        ]
      };
    }
    
    // گروه‌بندی بر اساس دسته‌بندی
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
      content: [
        {
          type: 'text',
          text: listText
        }
      ]
    };
  }

  // فراموش کردن
  async handleMemoryForget(item) {
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
      content: [
        {
          type: 'text',
          text: found ? 
            `🗑️ فراموش شد: ${item}` : 
            `❌ چیزی با "${item}" پیدا نشد`
        }
      ]
    };
  }

  // ساخت فرم با ساب کامند
  async handleFormGenerator(formType, style) {
    if (!style) {
      return {
        content: [
          {
            type: 'text',
            text: `🎨 انتخاب سبک فرم "${formType}":\n\n` +
                  `1️⃣ ساده (simple) - فرم ساده و کاربردی\n` +
                  `2️⃣ پیشرفته (advanced) - فرم کامل با اعتبارسنجی\n` +
                  `3️⃣ مدرن (modern) - طراحی مدرن و زیبا\n` +
                  `4️⃣ کلاسیک (classic) - سبک سنتی\n\n` +
                  `لطفاً شماره گزینه مورد نظر را بگویید: "گزینه 2" یا "2"`
          }
        ]
      };
    }

    // تبدیل شماره به سبک
    const styleMap = {
      '1': 'simple',
      '2': 'advanced',
      '3': 'modern', 
      '4': 'classic'
    };
    
    const finalStyle = styleMap[style] || style;
    
    // ساخت فرم
    const formHTML = this.generateFormHTML(formType, finalStyle);
    const fileName = `${formType}-${finalStyle}-${Date.now()}.html`;
    const filePath = path.join(this.formsPath, fileName);
    
    fs.writeFileSync(filePath, formHTML, 'utf8');
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ فرم ${formType} با سبک ${finalStyle} ایجاد شد!\n` +
                `📁 مسیر: ${filePath}\n\n` +
                `🔗 برای مشاهده فرم، فایل HTML را در مرورگر باز کنید.`
        }
      ]
    };
  }

  generateFormHTML(formType, style) {
    const baseStyles = {
      simple: `
        body { font-family: Tahoma, Arial; direction: rtl; margin: 20px; }
        form { max-width: 400px; margin: 0 auto; }
        input, textarea, select { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; }
        button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #005a87; }
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
      `,
      classic: `
        body { font-family: Times, serif; direction: rtl; margin: 20px; background: #fafafa; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 25px; border: 2px solid #333; }
        h2 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; }
        td { padding: 8px; vertical-align: top; }
        input, textarea, select { width: 100%; padding: 6px; border: 1px solid #666; font-family: inherit; }
        button { background: #333; color: white; padding: 12px 25px; border: 2px solid #333; cursor: pointer; font-family: inherit; }
        button:hover { background: white; color: #333; }
      `
    };

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
    console.error('🚀 سرور MCP فارسی راه‌اندازی شد');
  }
}

const server = new PersianMCPServer();
server.run().catch(console.error);

