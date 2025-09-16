// server/utils/decode.js
export function getHFToken() {
  const b64 = process.env.HF_TOKEN_B64 || '';
  if (!b64) throw new Error('HuggingFace token not found: set HF_TOKEN_B64');

  let token = '';
  try {
    token = Buffer.from(b64, 'base64').toString('utf8').trim();
  } catch {
    throw new Error('Invalid HF_TOKEN_B64: base64 decode failed');
  }

  if (!/^hf_[A-Za-z0-9_-]{20,}$/.test(token)) {
    throw new Error('Decoded HF token format is invalid');
  }
  return token;
}

export async function testHFConnection(fetchImpl = fetch) {
  const token = getHFToken();
  // A light-weight sanity check against HF API without heavy deps
  const resp = await fetchImpl('https://huggingface.co/api/whoami-v2', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`HF whoami failed: HTTP ${resp.status} ${text}`);
  }
  return resp.json();
}

// Legacy functions for backward compatibility with existing code
export function getHFHeaders() {
  const token = getHFToken();
  
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'User-Agent': 'Persian-Legal-AI/1.0'
  };
}

export function logTokenStatus() {
  try {
    const token = getHFToken();
    console.log('✅ HuggingFace token is properly configured');
    console.log(`   Token prefix: ${token.substring(0, 10)}...`);
  } catch (error) {
    console.error('❌ HuggingFace token configuration is invalid');
    console.error(`   Error: ${error.message}`);
  }
}
