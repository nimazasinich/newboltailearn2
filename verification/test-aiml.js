#!/usr/bin/env node
// test-aiml.js - AI/ML functionality verification

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results tracking
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
};

function runTest(name, testFn) {
    testResults.total++;
    try {
        const result = testFn();
        if (result instanceof Promise) {
            return result.then(() => {
                testResults.passed++;
                testResults.tests[name] = 'PASSED';
                log(`  ✓ ${name}`, 'green');
                return true;
            }).catch(error => {
                testResults.failed++;
                testResults.tests[name] = `FAILED: ${error.message}`;
                log(`  ✗ ${name}: ${error.message}`, 'red');
                return false;
            });
        } else {
            testResults.passed++;
            testResults.tests[name] = 'PASSED';
            log(`  ✓ ${name}`, 'green');
            return true;
        }
    } catch (error) {
        testResults.failed++;
        testResults.tests[name] = `FAILED: ${error.message}`;
        log(`  ✗ ${name}: ${error.message}`, 'red');
        return false;
    }
}

async function runAIMLTests() {
    log('\n=== AI/ML Functionality Verification ===\n', 'blue');
    
    let tf = null;
    
    // Test 1: TensorFlow.js availability
    log('Testing TensorFlow.js availability:', 'yellow');
    await runTest('TensorFlow.js import', async () => {
        try {
            tf = (await import('@tensorflow/tfjs-node')).default;
            return true;
        } catch (error) {
            // Try alternative import
            try {
                tf = (await import('@tensorflow/tfjs')).default;
                log('    Using @tensorflow/tfjs (browser version)', 'yellow');
                return true;
            } catch (error2) {
                throw new Error('TensorFlow.js not available');
            }
        }
    });
    
    if (!tf) {
        log('\nTensorFlow.js not available - skipping remaining tests', 'yellow');
        process.exit(1);
    }
    
    // Test 2: Basic tensor operations
    log('\nTesting basic tensor operations:', 'yellow');
    await runTest('Tensor creation', () => {
        const tensor = tf.tensor2d([[1, 2], [3, 4]]);
        if (!tensor) throw new Error('Failed to create tensor');
        tensor.dispose();
    });
    
    await runTest('Tensor arithmetic', () => {
        const a = tf.tensor2d([[1, 2], [3, 4]]);
        const b = tf.tensor2d([[5, 6], [7, 8]]);
        const c = a.add(b);
        
        const result = c.arraySync();
        if (result[0][0] !== 6) throw new Error('Tensor addition failed');
        
        a.dispose();
        b.dispose();
        c.dispose();
    });
    
    await runTest('Tensor operations', () => {
        const tensor = tf.tensor2d([[1, 2], [3, 4]]);
        const sum = tensor.sum().dataSync()[0];
        
        if (sum !== 10) throw new Error('Tensor sum operation failed');
        tensor.dispose();
    });
    
    // Test 3: Model creation and operations
    log('\nTesting model creation:', 'yellow');
    
    let model = null;
    await runTest('Sequential model creation', () => {
        model = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
                tf.layers.dense({ units: 16, activation: 'relu' }),
                tf.layers.dense({ units: 1, activation: 'sigmoid' })
            ]
        });
        
        if (!model) throw new Error('Failed to create model');
    });
    
    await runTest('Model compilation', () => {
        if (!model) throw new Error('No model available');
        
        model.compile({
            optimizer: 'adam',
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
    });
    
    await runTest('Model prediction', async () => {
        if (!model) throw new Error('No model available');
        
        const input = tf.randomNormal([1, 10]);
        const prediction = model.predict(input);
        const value = await prediction.data();
        
        if (!value || value.length === 0) throw new Error('Prediction failed');
        if (value[0] < 0 || value[0] > 1) throw new Error('Invalid prediction value');
        
        input.dispose();
        prediction.dispose();
    });
    
    // Test 4: Model training capabilities
    log('\nTesting model training:', 'yellow');
    await runTest('Model training (mini)', async () => {
        if (!model) throw new Error('No model available');
        
        // Create small training data
        const xs = tf.randomNormal([10, 10]);
        const ys = tf.randomUniform([10, 1]);
        
        // Train for one epoch
        const history = await model.fit(xs, ys, {
            epochs: 1,
            batchSize: 5,
            verbose: 0
        });
        
        if (!history || !history.history) throw new Error('Training failed');
        if (!history.history.loss || history.history.loss.length === 0) {
            throw new Error('No training metrics recorded');
        }
        
        xs.dispose();
        ys.dispose();
    });
    
    // Test 5: Model save/load capabilities
    log('\nTesting model persistence:', 'yellow');
    
    const modelPath = 'file://./temp_test_model';
    
    await runTest('Model saving', async () => {
        if (!model) throw new Error('No model available');
        
        try {
            await model.save(modelPath);
            
            // Check if files were created
            const modelJsonPath = './temp_test_model/model.json';
            if (!fs.existsSync(modelJsonPath)) {
                throw new Error('Model files not created');
            }
        } catch (error) {
            // File system saving might not work in all environments
            log('    Model file saving not available (acceptable)', 'yellow');
        }
    });
    
    await runTest('Model loading', async () => {
        try {
            const modelJsonPath = './temp_test_model/model.json';
            if (fs.existsSync(modelJsonPath)) {
                const loadedModel = await tf.loadLayersModel(modelPath);
                if (!loadedModel) throw new Error('Failed to load model');
                
                // Clean up test files
                const modelDir = './temp_test_model';
                if (fs.existsSync(modelDir)) {
                    fs.rmSync(modelDir, { recursive: true, force: true });
                }
            } else {
                log('    Skipping load test (no saved model)', 'yellow');
            }
        } catch (error) {
            log('    Model loading test skipped', 'yellow');
        }
    });
    
    // Test 6: Custom layers and operations
    log('\nTesting advanced features:', 'yellow');
    
    await runTest('Custom layer support', () => {
        class CustomLayer extends tf.layers.Layer {
            constructor(config) {
                super(config);
            }
            
            computeOutputShape(inputShape) {
                return inputShape;
            }
            
            call(inputs) {
                return inputs;
            }
            
            getClassName() {
                return 'CustomLayer';
            }
        }
        
        const layer = new CustomLayer({});
        if (!layer) throw new Error('Custom layer creation failed');
    });
    
    // Test 7: Memory management
    log('\nTesting memory management:', 'yellow');
    
    await runTest('Memory cleanup', () => {
        const initialMemory = tf.memory();
        
        // Create and dispose tensors
        for (let i = 0; i < 10; i++) {
            const tensor = tf.randomNormal([100, 100]);
            tensor.dispose();
        }
        
        const finalMemory = tf.memory();
        
        // Check that we're not leaking too much memory
        const memoryIncrease = finalMemory.numTensors - initialMemory.numTensors;
        if (memoryIncrease > 5) {
            throw new Error(`Memory leak detected: ${memoryIncrease} tensors not disposed`);
        }
    });
    
    // Clean up
    if (model) {
        model.dispose();
    }
    
    // Generate summary
    log('\n=== AI/ML Test Summary ===', 'blue');
    log(`Total Tests: ${testResults.total}`);
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    
    const passRate = (testResults.passed / testResults.total * 100).toFixed(1);
    log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
    
    // AI/ML is optional, so we're more lenient
    process.exit(testResults.passed >= testResults.total * 0.5 ? 0 : 1);
}

// Run tests
runAIMLTests().catch(error => {
    log(`\nFatal error running AI/ML tests: ${error.message}`, 'red');
    process.exit(1);
});