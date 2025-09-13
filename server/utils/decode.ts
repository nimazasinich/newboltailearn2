import { Buffer } from "buffer";

/**
 * Secure HuggingFace Token Management
 * 
 * This utility handles encoding/decoding of HuggingFace tokens
 * to prevent accidental exposure in version control.
 */

export interface TokenConfig {
  encoded: string;
  decoded: string;
  isValid: boolean;
}

/**
 * Decode HuggingFace token from Base64 encoded string
 * @returns Decoded HuggingFace token
 * @throws Error if token is missing or invalid
 */
export function getHFToken(): string {
  const encoded = process.env.HF_TOKEN_ENC;
  
  if (!encoded) {
    throw new Error('HuggingFace token not found in environment variables. Please set HF_TOKEN_ENC.');
  }

  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    
    // Validate token format
    if (!decoded.startsWith('hf_')) {
      throw new Error('Invalid HuggingFace token format');
    }
    
    return decoded;
  } catch (error) {
    throw new Error(`Failed to decode HuggingFace token: ${(error as Error).message}`);
  }
}

/**
 * Encode HuggingFace token to Base64
 * @param token - Raw HuggingFace token
 * @returns Base64 encoded token
 */
export function encodeHFToken(token: string): string {
  if (!token.startsWith('hf_')) {
    throw new Error('Invalid HuggingFace token format. Token must start with "hf_"');
  }
  
  return Buffer.from(token, 'utf8').toString('base64');
}

/**
 * Validate token configuration
 * @returns Token configuration with validation status
 */
export function validateTokenConfig(): TokenConfig {
  const encoded = process.env.HF_TOKEN_ENC;
  
  if (!encoded) {
    return {
      encoded: '',
      decoded: '',
      isValid: false
    };
  }

  try {
    const decoded = getHFToken();
    return {
      encoded,
      decoded,
      isValid: true
    };
  } catch (_error) {
    return {
      encoded,
      decoded: '',
      isValid: false
    };
  }
}

/**
 * Test HuggingFace API connection with decoded token
 * @returns Promise<boolean> - Connection test result
 */
export async function testHFConnection(): Promise<boolean> {
  try {
    const token = getHFToken();
    
    const response = await fetch('https://huggingface.co/api/whoami', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.ok;
  } catch (_error) {
    console.error('HuggingFace connection test failed:', _error);
    return false;
  }
}

/**
 * Get HuggingFace API headers with authentication
 * @returns Headers object with Bearer token
 */
export function getHFHeaders(): Record<string, string> {
  const token = getHFToken();
  
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'User-Agent': 'Persian-Legal-AI/1.0'
  };
}

/**
 * Log token status (without exposing the actual token)
 */
export function logTokenStatus(): void {
  const config = validateTokenConfig();
  
  if (config.isValid) {
    console.log('✅ HuggingFace token is properly configured');
    console.log(`   Encoded length: ${config.encoded.length} characters`);
    console.log(`   Token prefix: ${config.decoded.substring(0, 10)}...`);
  } else {
    console.error('❌ HuggingFace token configuration is invalid');
    console.error('   Please check HF_TOKEN_ENC environment variable');
  }
}