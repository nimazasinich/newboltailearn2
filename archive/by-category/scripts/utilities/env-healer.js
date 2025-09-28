// env-healer.js - Environment healing with secret generation
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateSecret(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

function generateBase64Secret(length = 32) {
    return Buffer.from(crypto.randomBytes(length)).toString('base64');
}

function healEnvironment() {
    console.log('🔧 Starting environment healing...');
    
    const envPath = '.env';
    const envSamplePath = '.env.sample';
    
    // Check if .env exists, create from sample if available
    if (!fs.existsSync(envPath)) {
        if (fs.existsSync(envSamplePath)) {
            fs.copyFileSync(envSamplePath, envPath);
            console.log('✅ Copied .env.sample to .env');
        } else {
            fs.writeFileSync(envPath, '# Auto-generated .env file\n');
            console.log('✅ Created new .env file');
        }
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    let modified = false;
    
    // Required secrets and their default values
    const requiredSecrets = {
        'JWT_SECRET': generateSecret(64),
        'SESSION_SECRET': generateSecret(64),
        'CSRF_SECRET': generateSecret(32),
        'HF_TOKEN_B64': generateBase64Secret(32),
        'DEMO_MODE': 'true',
        'USE_FAKE_DATA': 'false',
        'NODE_ENV': 'test',
        'PORT': '3000',
        'DB_PATH': './persian_legal_ai.db',
        'CORS_ORIGIN': 'http://localhost:3000',
        'RATE_LIMIT_WINDOW_MS': '900000',
        'RATE_LIMIT_MAX_REQUESTS': '100',
        'SESSION_COOKIE_SECURE': 'false',
        'SESSION_COOKIE_HTTP_ONLY': 'true',
        'SESSION_COOKIE_SAME_SITE': 'lax',
        'SESSION_MAX_AGE': '86400000'
    };
    
    // Add missing environment variables
    for (const [key, defaultValue] of Object.entries(requiredSecrets)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (!regex.test(envContent)) {
            envContent += `${key}=${defaultValue}\n`;
            modified = true;
            console.log(`✅ Added ${key} to .env`);
        }
    }
    
    // Ensure no duplicate entries
    const lines = envContent.split('\n');
    const seen = new Set();
    const cleanedLines = lines.filter(line => {
        if (line.trim() === '' || line.startsWith('#')) {
            return true;
        }
        const key = line.split('=')[0];
        if (seen.has(key)) {
            console.log(`🔧 Removed duplicate ${key} from .env`);
            return false;
        }
        seen.add(key);
        return true;
    });
    
    if (cleanedLines.length !== lines.length) {
        envContent = cleanedLines.join('\n');
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Environment file healed successfully');
    } else {
        console.log('✅ Environment file already properly configured');
    }
    
    // Validate environment variables
    const envVars = {};
    envContent.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
    
    console.log(`📊 Environment validation: ${Object.keys(envVars).length} variables configured`);
    
    return {
        success: true,
        variablesCount: Object.keys(envVars).length,
        modified: modified,
        timestamp: new Date().toISOString()
    };
}

// Export for use in other modules
export { healEnvironment, generateSecret, generateBase64Secret };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const result = healEnvironment();
    console.log('Environment healing result:', result);
    process.exit(result.success ? 0 : 1);
}