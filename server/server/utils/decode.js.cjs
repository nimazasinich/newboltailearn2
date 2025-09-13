"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHFToken = getHFToken;
exports.encodeHFToken = encodeHFToken;
exports.validateTokenConfig = validateTokenConfig;
exports.testHFConnection = testHFConnection;
exports.getHFHeaders = getHFHeaders;
exports.logTokenStatus = logTokenStatus;
const buffer_1 = require("buffer");
/**
 * Decode HuggingFace token from Base64 encoded string
 * @returns Decoded HuggingFace token
 * @throws Error if token is missing or invalid
 */
function getHFToken() {
    const encoded = process.env.HF_TOKEN_ENC;
    if (!encoded) {
        throw new Error('HuggingFace token not found in environment variables. Please set HF_TOKEN_ENC.');
    }
    try {
        const decoded = buffer_1.Buffer.from(encoded, 'base64').toString('utf8');
        // Validate token format
        if (!decoded.startsWith('hf_')) {
            throw new Error('Invalid HuggingFace token format');
        }
        return decoded;
    }
    catch (error) {
        throw new Error(`Failed to decode HuggingFace token: ${error.message}`);
    }
}
/**
 * Encode HuggingFace token to Base64
 * @param token - Raw HuggingFace token
 * @returns Base64 encoded token
 */
function encodeHFToken(token) {
    if (!token.startsWith('hf_')) {
        throw new Error('Invalid HuggingFace token format. Token must start with "hf_"');
    }
    return buffer_1.Buffer.from(token, 'utf8').toString('base64');
}
/**
 * Validate token configuration
 * @returns Token configuration with validation status
 */
function validateTokenConfig() {
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
    }
    catch (error) {
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
async function testHFConnection() {
    try {
        const token = getHFToken();
        const response = await fetch('https://huggingface.co/api/whoami', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.ok;
    }
    catch (error) {
        console.error('HuggingFace connection test failed:', error);
        return false;
    }
}
/**
 * Get HuggingFace API headers with authentication
 * @returns Headers object with Bearer token
 */
function getHFHeaders() {
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
function logTokenStatus() {
    const config = validateTokenConfig();
    if (config.isValid) {
        console.log('✅ HuggingFace token is properly configured');
        console.log(`   Encoded length: ${config.encoded.length} characters`);
        console.log(`   Token prefix: ${config.decoded.substring(0, 10)}...`);
    }
    else {
        console.error('❌ HuggingFace token configuration is invalid');
        console.error('   Please check HF_TOKEN_ENC environment variable');
    }
}
