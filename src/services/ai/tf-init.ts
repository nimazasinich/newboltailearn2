import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl'; // ONLY WebGL

export async function initTF() {
  await tf.setBackend('webgl');
  await tf.ready();
  const backend = tf.getBackend();
  if (backend !== 'webgl') throw new Error(`Expected WebGL, got ${backend}`);
  return { backend, version: tf.version_core };
}

// Auto-initialize when module is imported
initTF().catch(console.error);