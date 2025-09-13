import fs from 'fs';
import path from 'path';

// HuggingFace token utilities for secure authentication
export async function getHFToken(): Promise<string> {
  // Try to get token from environment variable first
  const envToken = process.env.HUGGINGFACE_TOKEN;
  if (envToken) {
    return envToken;
  }

  // Try to get token from config file
  try {
    const configPath = path.join(process.cwd(), 'config', 'huggingface.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.token) {
        return config.token;
      }
    }
  } catch (error) {
    console.warn('Could not read HuggingFace config file:', error.message);
  }

  // Try to get token from database settings
  try {
    const Database = (await import('better-sqlite3')).default;
    const dbPath = path.join(process.cwd(), 'persian_legal_ai.db');
    if (fs.existsSync(dbPath)) {
      const db = new Database(dbPath);
      const setting = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('huggingface_token') as any;
      if (setting && setting.value) {
        return setting.value;
      }
    }
  } catch (error) {
    console.warn('Could not read HuggingFace token from database:', error.message);
  }

  // Return empty string if no token found
  return '';
}

export async function getHFHeaders(): Promise<Record<string, string>> {
  const token = await getHFToken();
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'Persian-Legal-AI/1.0'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function testHFConnection(): Promise<boolean> {
  try {
    const headers = await getHFHeaders();
    const response = await fetch('https://huggingface.co/api/whoami', {
      headers
    });

    if (response.ok) {
      const userInfo = await response.json();
      console.log(`Connected to HuggingFace as: ${userInfo.name || 'Anonymous'}`);
      return true;
    } else if (response.status === 401) {
      console.log('HuggingFace authentication failed - using anonymous access');
      return false;
    } else {
      console.log(`HuggingFace connection test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('HuggingFace connection test error:', error.message);
    return false;
  }
}

export async function logTokenStatus(): Promise<void> {
  const token = await getHFToken();
  
  if (token) {
    const maskedToken = token.length > 8 
      ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
      : '***';
    console.log(`🔑 HuggingFace token configured: ${maskedToken}`);
  } else {
    console.log('⚠️  No HuggingFace token configured - using anonymous access');
    console.log('   To configure: Set HUGGINGFACE_TOKEN environment variable or add to config/huggingface.json');
  }
}

// Utility function to validate token format
export function validateHFToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // HuggingFace tokens are typically 37 characters long and start with 'hf_'
  return token.startsWith('hf_') && token.length >= 30;
}

// Function to save token securely
export async function saveHFToken(token: string): Promise<boolean> {
  try {
    if (!validateHFToken(token)) {
      throw new Error('Invalid HuggingFace token format');
    }

    // Save to environment variable (for current session)
    process.env.HUGGINGFACE_TOKEN = token;

    // Save to database
    const Database = (await import('better-sqlite3')).default;
    const dbPath = path.join(process.cwd(), 'persian_legal_ai.db');
    const db = new Database(dbPath);
    
    db.prepare(`
      INSERT OR REPLACE INTO system_settings (key, value, description, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run('huggingface_token', token, 'HuggingFace API token for authentication');

    console.log('✅ HuggingFace token saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save HuggingFace token:', error.message);
    return false;
  }
}

// Function to clear token
export async function clearHFToken(): Promise<boolean> {
  try {
    // Clear from environment
    delete process.env.HUGGINGFACE_TOKEN;

    // Clear from database
    const Database = (await import('better-sqlite3')).default;
    const dbPath = path.join(process.cwd(), 'persian_legal_ai.db');
    const db = new Database(dbPath);
    
    db.prepare('DELETE FROM system_settings WHERE key = ?').run('huggingface_token');

    console.log('🗑️  HuggingFace token cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear HuggingFace token:', error.message);
    return false;
  }
}