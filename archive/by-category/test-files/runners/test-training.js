import { getRealTrainingEngine } from './server/training/RealTrainingEngineImpl.js';
import Database from 'better-sqlite3';

async function testTraining() {
  console.log('🧪 Testing Real Training Engine...');
  
  try {
    // Create a test database
    const db = new Database(':memory:');
    
    // Initialize training engine
    const engine = getRealTrainingEngine(db);
    
    // Test model initialization
    console.log('📊 Initializing model...');
    await engine.initializeModel(3); // 3 classes for legal text
    
    // Test data preparation
    console.log('📚 Preparing test data...');
    const { trainX, trainY, valX, valY } = await engine.prepareData('test-dataset');
    
    console.log(`✅ Training data shape: ${trainX.shape}`);
    console.log(`✅ Validation data shape: ${valX.shape}`);
    
    // Test training with minimal epochs
    console.log('🚀 Starting training (2 epochs)...');
    const trainingConfig = {
      epochs: 2,
      batchSize: 8,
      learningRate: 0.001,
      validationSplit: 0.2
    };
    
    let progressCount = 0;
    await engine.train(1, 'test-dataset', trainingConfig, (progress) => {
      progressCount++;
      console.log(`📈 Epoch ${progress.epoch}: loss=${progress.loss.toFixed(4)}, accuracy=${progress.accuracy.toFixed(4)}`);
    });
    
    console.log(`✅ Training completed! Progress callbacks received: ${progressCount}`);
    
    // Test prediction
    console.log('🔮 Testing prediction...');
    const testText = 'این قرارداد بین طرفین منعقد شده است';
    const prediction = await engine.predict(testText);
    console.log(`✅ Prediction for "${testText}": class=${prediction.class}, probabilities=[${prediction.probabilities.map(p => p.toFixed(3)).join(', ')}]`);
    
    console.log('🎉 All tests passed! Real training engine is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testTraining();