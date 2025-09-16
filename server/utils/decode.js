import { Buffer } from "buffer";
/**
 * Decode HuggingFace token from Base64 encoded string
 * @returns Decoded HuggingFace token
 * @throws Error if token is missing or invalid
 */
export function getHFToken() {
    const b64 = process.env.HF_TOKEN_B64 || '';
    if (!b64) return null;
    try {
        return Buffer.from(b64, 'base64').toString('utf8').trim() || null;
    } catch (e) {
        console.error('❌ Failed to decode HF_TOKEN_B64:', e.message);
        return null;
    }
}
/**
 * Encode HuggingFace token to Base64
 * @param token - Raw HuggingFace token
 * @returns Base64 encoded token
 */
export function encodeHFToken(token) {
    if (!token.startsWith('hf_')) {
        throw new Error('Invalid HuggingFace token format. Token must start with "hf_"');
    }
    return Buffer.from(token, 'utf8').toString('base64');
}
/**
 * Validate token configuration
 * @returns Token configuration with validation status
 */
export function validateTokenConfig() {
    const encoded = process.env.HF_TOKEN_B64 || process.env.HF_TOKEN_ENC;
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
    catch (_error) {
        return {
            encoded,
            decoded: '',
            isValid: false
        };
    }
}
export async function testHFConnection(fetchImpl = fetch) {
    const token = getHFToken();
    if (!token) return { ok: false, reason: 'token-missing' };
    try {
        const res = await fetchImpl('https://huggingface.co/api/whoami-v2', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { ok: res.ok, status: res.status };
    } catch (e) {
        return { ok: false, reason: e.message || 'network-error' };
    }
}
/**
 * Get HuggingFace API headers with authentication
 * @returns Headers object with Bearer token
 */
export function getHFHeaders() {
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
export function logTokenStatus() {
    const config = validateTokenConfig();
    if (config.isValid) {
        console.log('✅ HuggingFace token is properly configured');
        console.log(`   Encoded length: ${config.encoded.length} characters`);
        console.log(`   Token prefix: ${config.decoded.substring(0, 10)}...`);
    }
    else {
        console.error('❌ HuggingFace token configuration is invalid');
        console.error('   Please check HF_TOKEN_B64 environment variable');
    }
}
