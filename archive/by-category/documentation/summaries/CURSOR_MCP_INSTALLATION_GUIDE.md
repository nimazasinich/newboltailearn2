# 🚀 Cursor MCP Server Installation Guide

## ✅ Test Results
- **Node.js Version**: v22.19.0 ✅ (Meets requirement: v22+)
- **MCP Server Syntax**: Valid ✅
- **Server Functionality**: Working ✅
- **Configuration Generated**: ✅

## 📋 Installation Steps

### Step 1: Locate Cursor Settings
1. Open Cursor
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "Preferences: Open Settings (JSON)"
4. Select it to open the settings file

### Step 2: Add MCP Configuration
Add the following configuration to your Cursor settings.json:

```json
{
  "mcpServers": {
    "smart-persian-mcp": {
      "command": "node",
      "args": ["./smart-persian-mcp-bundle.mjs"],
      "env": {
        "MEMORY_PATH": "./cursor-memory",
        "OUTPUT_PATH": "./cursor-outputs"
      },
      "disabled": false,
      "autoApprove": ["read_file", "list_tools", "call_tool"]
    }
  }
}
```

### Step 3: Alternative - Use Generated Config
The server has already generated a complete configuration file at:
`complete-mcp-config.json`

You can copy the contents of this file and merge it with your Cursor settings.

### Step 4: Restart Cursor
1. Close Cursor completely
2. Reopen Cursor
3. The MCP server should now be available

## 🧪 Verification Steps

### Test 1: Check MCP Connection
1. Open Cursor
2. Look for a green dot next to the MCP server icon in the status bar
3. If green, the connection is successful

### Test 2: Test MCP Tools
In Cursor's chat interface, try:
```
Help me create a blue button with the smart-persian-mcp server
```

### Test 3: Available Tools
The server provides these tools:
- `smart_create` - Create web elements (button, card, form, header, page)
- `quick_create` - Describe what you want and get it generated
- `generate_template` - Generate full page templates
- `build_component` - Compose multiple elements
- `smart_suggest` - Get intelligent UI suggestions
- `manage_preferences` - Save/load preferences
- `optimize_code` - Optimize HTML files
- `get_analytics` - Usage analytics
- `natural_process` - Convert natural text to component specs

## 🎯 Example Usage

### Create a Button
```
Create a modern blue button with gradient effect
```

### Create a Landing Page
```
Generate a landing page template for a tech company
```

### Get Suggestions
```
Suggest UI components for a restaurant website
```

## 🔧 Troubleshooting

### Issue: MCP Server Not Connecting
**Solution**: 
1. Check that Node.js v22+ is installed
2. Verify the file path in the configuration
3. Restart Cursor

### Issue: Tools Not Available
**Solution**:
1. Check Cursor's MCP status in the status bar
2. Look for error messages in Cursor's developer console
3. Verify the server file exists and is executable

### Issue: Permission Errors
**Solution**:
1. Make sure the MCP server file has execute permissions
2. Check that the output directories can be created

## 📁 File Structure
```
project/
├── smart-persian-mcp-bundle.mjs    # Main MCP server
├── complete-mcp-config.json        # Generated config
├── cursor-memory/                  # Server memory (auto-created)
└── cursor-outputs/                 # Generated files (auto-created)
```

## 🎉 Success!
Once installed, you can use natural language to create web components:

- "Create a modern button"
- "Generate a landing page"
- "Build a dashboard layout"
- "Suggest UI for my website"

The server supports both Persian and English, with automatic language detection and RTL support.
