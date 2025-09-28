import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

/**
 * Initialize TensorFlow.js with WebGL backend for GitHub Pages compatibility
 * This prevents WASM/SIMD feature flag errors on GitHub Pages
 */
export async function initializeTensorFlow(): Promise<void> {
  try {
    // Set WebGL backend explicitly
    await tf.setBackend('webgl');
    await tf.ready();
    
    // Verify backend is set correctly
    const backend = tf.getBackend();
    if (backend === 'webgl') {
      console.log('✅ TensorFlow.js initialized successfully with WebGL backend');
    } else {
      console.warn(`⚠️ TensorFlow.js backend is ${backend}, expected webgl`);
    }
  } catch (error) {
    console.error('❌ TensorFlow.js initialization failed:', error);
    throw error;
  }
}

// Auto-initialize when module is imported
initializeTensorFlow().catch(console.error);