#!/usr/bin/env node
/**
 * Create Cursor MCP Install Link
 * 
 * This script creates a proper Cursor MCP install link following the format:
 * cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64_ENCODED_CONFIG
 */

import fs from 'fs';
import path from 'path';

// MCP Server Configuration
const mcpConfig = {
  "$schema": "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/mcp.json",
  "mcpServers": {
    "cursor-mcp-server": {
      "command": "node",
      "args": ["./cursor-mcp-server.mjs"],
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
const serverName = "cursor-mcp-server";

// Convert config to JSON string
const configJson = JSON.stringify(mcpConfig, null, 2);

// Encode config to Base64
const base64Config = Buffer.from(configJson, 'utf8').toString('base64');

// Create install link
const installLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${serverName}&config=${base64Config}`;

// Save files
fs.writeFileSync('cursor-mcp-config.json', configJson, 'utf8');
fs.writeFileSync('cursor-install-link.txt', installLink, 'utf8');

// Create HTML file for easy clicking
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cursor MCP Server Install</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            max-width: 800px;
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Cursor MCP Server Installation</h1>
        
        <p>This MCP server provides memory management and component creation capabilities for Cursor.</p>
        
        <h2>📋 Features</h2>
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
                <h3>⚡ Command Execution</h3>
                <p>Execute custom commands and save preferences</p>
            </div>
        </div>
        
        <h2>🔗 Install Link</h2>
        <p>Click the button below to install the MCP server in Cursor:</p>
        
        <a href="${installLink}" class="install-link">
            📥 Install Cursor MCP Server
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
            <li><code>Create a blue button with text "Test"</code></li>
            <li><code>List all items in memory</code></li>
            <li><code>Create a contact form</code></li>
        </ul>
        
        <h2>📁 Files</h2>
        <p>The following files will be created:</p>
        <ul>
            <li><code>cursor-mcp-server.mjs</code> - Main server file</li>
            <li><code>cursor-mcp-config.json</code> - Configuration file</li>
            <li><code>cursor-memory/</code> - Memory storage directory</li>
            <li><code>cursor-outputs/</code> - Generated files directory</li>
        </ul>
    </div>
</body>
</html>`;

fs.writeFileSync('cursor-install.html', htmlContent, 'utf8');

console.log('🎉 Cursor MCP Install Link Created!');
console.log('');
console.log('📁 Files created:');
console.log('  - cursor-mcp-config.json (Configuration)');
console.log('  - cursor-install-link.txt (Install link)');
console.log('  - cursor-install.html (Web page)');
console.log('');
console.log('🔗 Install Link:');
console.log(installLink);
console.log('');
console.log('📖 Instructions:');
console.log('1. Open cursor-install.html in your browser');
console.log('2. Click the "Install Cursor MCP Server" button');
console.log('3. Cursor will prompt you to install the server');
console.log('4. Confirm the installation');
console.log('5. Restart Cursor');
console.log('6. Test with: "Store my preference in memory"');
console.log('');
console.log('✅ Ready for installation!');
