#!/usr/bin/env node
/**
 * Create Enhanced Cursor MCP Install Link
 * 
 * This script creates a proper Cursor MCP install link for the enhanced server
 * with all services (Canva, Dart, DigitalOcean, Figma, GitHub, JetBrains, MongoDB, React, Shopify, Vercel)
 */

import fs from 'fs';
import path from 'path';

// Enhanced MCP Server Configuration
const mcpConfig = {
  "$schema": "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/mcp.json",
  "mcpServers": {
    "enhanced-cursor-mcp-server": {
      "command": "node",
      "args": ["./enhanced-cursor-mcp-server.mjs"],
      "env": {
        "MEMORY_PATH": "./cursor-memory",
        "OUTPUT_PATH": "./cursor-outputs"
      },
      "disabled": false,
      "autoApprove": [
        "read_file",
        "list_tools",
        "call_tool"
      ]
    }
  }
};

// Server name
const serverName = "enhanced-cursor-mcp-server";

// Convert config to JSON string
const configJson = JSON.stringify(mcpConfig, null, 2);

// Encode config to Base64
const base64Config = Buffer.from(configJson, 'utf8').toString('base64');

// Create install link
const installLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${serverName}&config=${base64Config}`;

// Save files
fs.writeFileSync('enhanced-cursor-mcp-config.json', configJson, 'utf8');
fs.writeFileSync('enhanced-install-link.txt', installLink, 'utf8');

// Create HTML file for easy clicking
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Cursor MCP Server Install</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f7fa;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .install-link {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        .install-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 30px 0;
        }
        .service {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .service h4 {
            margin: 0 0 10px 0;
            color: #667eea;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .feature h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .config-preview {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Enhanced Cursor MCP Server Installation</h1>
        
        <p>This enhanced MCP server provides memory management, component creation, and integration with 10 popular services.</p>
        
        <h2>🛠️ Available Services</h2>
        <div class="services-grid">
            <div class="service">
                <h4>🎨 Canva</h4>
                <p>Create apps, add features, check designs</p>
            </div>
            <div class="service">
                <h4>🎯 Dart</h4>
                <p>List projects, manage tasks, time tracking</p>
            </div>
            <div class="service">
                <h4>☁️ DigitalOcean</h4>
                <p>List apps, deploy from GitHub, redeploy</p>
            </div>
            <div class="service">
                <h4>🎨 Figma</h4>
                <p>Convert frames, extract layers, check components</p>
            </div>
            <div class="service">
                <h4>🐙 GitHub</h4>
                <p>List repos, read files, create issues</p>
            </div>
            <div class="service">
                <h4>💡 JetBrains</h4>
                <p>Open projects, refactor code, generate code</p>
            </div>
            <div class="service">
                <h4>🗄 MongoDB</h4>
                <p>Query data, create collections, show schema</p>
            </div>
            <div class="service">
                <h4>⚛️ React</h4>
                <p>Create apps, run server, install packages</p>
            </div>
            <div class="service">
                <h4>🛍 Shopify</h4>
                <p>Search docs, create functions, show APIs</p>
            </div>
            <div class="service">
                <h4>▲ Vercel</h4>
                <p>Deploy apps, show settings, get feedback</p>
            </div>
        </div>
        
        <h2>📋 Core Features</h2>
        <div class="features">
            <div class="feature">
                <h3>🧠 Memory Management</h3>
                <p>Store, retrieve, and manage information in persistent memory</p>
            </div>
            <div class="feature">
                <h3>🛠️ Component Creation</h3>
                <p>Create buttons, cards, forms, and pages with custom styling</p>
            </div>
            <div class="feature">
                <h3>🌐 Multi-language</h3>
                <p>Support for Persian and English with auto-detection</p>
            </div>
            <div class="feature">
                <h3>⚡ Service Integration</h3>
                <p>Execute commands across 10 popular development services</p>
            </div>
        </div>
        
        <h2>🔗 Install Link</h2>
        <p>Click the button below to install the enhanced MCP server in Cursor:</p>
        
        <a href="${installLink}" class="install-link">
            📥 Install Enhanced Cursor MCP Server
        </a>
        
        <h2>⚙️ Configuration</h2>
        <p>The following configuration will be added to your Cursor settings:</p>
        
        <div class="config-preview">
${configJson}
        </div>
        
        <h2>🧪 Testing</h2>
        <p>After installation, you can test the server with these commands:</p>
        <ul>
            <li><code>Store my preference in memory</code></li>
            <li><code>List all available services</code></li>
            <li><code>Get info about GitHub service</code></li>
            <li><code>Execute GitHub list-repos command</code></li>
            <li><code>Create a blue button with text "Test"</code></li>
        </ul>
        
        <h2>📁 Files</h2>
        <p>The following files will be created:</p>
        <ul>
            <li><code>enhanced-cursor-mcp-server.mjs</code> - Main server file</li>
            <li><code>enhanced-cursor-mcp-config.json</code> - Configuration file</li>
            <li><code>cursor-memory/</code> - Memory storage directory</li>
            <li><code>cursor-outputs/</code> - Generated files directory</li>
        </ul>
        
        <h2>🎯 Service Commands</h2>
        <p>Example commands for each service:</p>
        <ul>
            <li><strong>Canva:</strong> <code>Execute canva create-app command</code></li>
            <li><strong>GitHub:</strong> <code>Execute github list-repos command</code></li>
            <li><strong>React:</strong> <code>Execute react create-app command</code></li>
            <li><strong>Vercel:</strong> <code>Execute vercel deploy-app command</code></li>
        </ul>
    </div>
</body>
</html>`;

fs.writeFileSync('enhanced-install.html', htmlContent, 'utf8');

console.log('🎉 Enhanced Cursor MCP Install Link Created!');
console.log('');
console.log('📁 Files created:');
console.log('  - enhanced-cursor-mcp-config.json (Configuration)');
console.log('  - enhanced-install-link.txt (Install link)');
console.log('  - enhanced-install.html (Web page)');
console.log('');
console.log('🔗 Install Link:');
console.log(installLink);
console.log('');
console.log('🛠️ Available Services:');
console.log('  - Canva (🎨) - Create apps, add features, check designs');
console.log('  - Dart (🎯) - List projects, manage tasks, time tracking');
console.log('  - DigitalOcean (☁️) - List apps, deploy from GitHub, redeploy');
console.log('  - Figma (🎨) - Convert frames, extract layers, check components');
console.log('  - GitHub (🐙) - List repos, read files, create issues');
console.log('  - JetBrains (💡) - Open projects, refactor code, generate code');
console.log('  - MongoDB (🗄) - Query data, create collections, show schema');
console.log('  - React (⚛️) - Create apps, run server, install packages');
console.log('  - Shopify (🛍) - Search docs, create functions, show APIs');
console.log('  - Vercel (▲) - Deploy apps, show settings, get feedback');
console.log('');
console.log('📖 Instructions:');
console.log('1. Open enhanced-install.html in your browser');
console.log('2. Click the "Install Enhanced Cursor MCP Server" button');
console.log('3. Cursor will prompt you to install the server');
console.log('4. Confirm the installation');
console.log('5. Restart Cursor');
console.log('6. Test with: "List all available services"');
console.log('');
console.log('✅ Ready for installation!');
