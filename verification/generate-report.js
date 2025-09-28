#!/usr/bin/env node
// generate-report.js - Generate HTML report from test results

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get results file from command line argument
const resultsFile = process.argv[2];

if (!resultsFile || !fs.existsSync(resultsFile)) {
    console.error('Usage: node generate-report.js <results-file.json>');
    process.exit(1);
}

// Read results
const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

// Generate HTML report
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Verification Report - ${new Date(results.timestamp).toLocaleString()}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .header .timestamp {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .summary-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .summary-card .number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .summary-card .label {
            color: #666;
            text-transform: uppercase;
            font-size: 0.9em;
            letter-spacing: 1px;
        }
        
        .summary-card.passed .number { color: #28a745; }
        .summary-card.failed .number { color: #dc3545; }
        .summary-card.warning .number { color: #ffc107; }
        .summary-card.total .number { color: #007bff; }
        
        .status-badge {
            display: inline-block;
            padding: 10px 30px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.2em;
            margin: 20px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .status-badge.success {
            background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
            color: #0a5f0a;
        }
        
        .status-badge.warning {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
            color: #856404;
        }
        
        .status-badge.failed {
            background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
            color: #721c24;
        }
        
        .tests-section {
            padding: 40px;
        }
        
        .tests-section h2 {
            font-size: 2em;
            margin-bottom: 30px;
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        
        .test-category {
            margin-bottom: 30px;
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }
        
        .test-category h3 {
            font-size: 1.5em;
            margin-bottom: 15px;
            color: #495057;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            margin: 8px 0;
            background: white;
            border-radius: 10px;
            transition: all 0.3s;
        }
        
        .test-item:hover {
            transform: translateX(5px);
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .test-name {
            font-weight: 500;
            flex: 1;
        }
        
        .test-status {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .test-status.passed {
            background: #d4edda;
            color: #155724;
        }
        
        .test-status.failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .test-status.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .icon {
            width: 24px;
            height: 24px;
            display: inline-block;
            vertical-align: middle;
        }
        
        .icon-check {
            color: #28a745;
        }
        
        .icon-x {
            color: #dc3545;
        }
        
        .icon-warning {
            color: #ffc107;
        }
        
        .details {
            padding: 40px;
            background: #f1f3f5;
        }
        
        .details h2 {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #495057;
        }
        
        .details-content {
            background: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            overflow-x: auto;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .footer {
            background: #343a40;
            color: white;
            text-align: center;
            padding: 20px;
        }
        
        .progress-ring {
            transform: rotate(-90deg);
            width: 120px;
            height: 120px;
            margin: 0 auto;
        }
        
        .progress-ring-circle {
            stroke-dasharray: 339.292;
            stroke-dashoffset: 339.292;
            animation: progress 1s ease-out forwards;
        }
        
        @keyframes progress {
            to {
                stroke-dashoffset: var(--progress);
            }
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }
            
            .summary {
                grid-template-columns: 1fr 1fr;
                padding: 20px;
            }
            
            .tests-section {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 System Verification Report</h1>
            <div class="timestamp">Generated: ${new Date(results.timestamp).toLocaleString()}</div>
            <div class="status-badge ${getOverallStatusClass(results.overallStatus || 'UNKNOWN')}">
                ${results.overallStatus || 'UNKNOWN'}
            </div>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <div class="number">${results.summary.total}</div>
                <div class="label">Total Tests</div>
            </div>
            <div class="summary-card passed">
                <div class="number">${results.summary.passed}</div>
                <div class="label">Passed</div>
            </div>
            <div class="summary-card failed">
                <div class="number">${results.summary.failed}</div>
                <div class="label">Failed</div>
            </div>
            <div class="summary-card warning">
                <div class="number">${results.summary.warnings}</div>
                <div class="label">Warnings</div>
            </div>
        </div>
        
        <div class="tests-section">
            <h2>Test Results by Category</h2>
            ${generateTestCategories(results.tests)}
        </div>
        
        ${results.tests.api_detailed ? generateDetailedApiResults(results.tests.api_detailed) : ''}
        
        <div class="details">
            <h2>Raw Test Data</h2>
            <div class="details-content">${JSON.stringify(results, null, 2)}</div>
        </div>
        
        <div class="footer">
            <p>Post-Archive Functionality Verification System</p>
            <p>Report completed at ${new Date(results.completedAt || results.timestamp).toLocaleString()}</p>
        </div>
    </div>
    
    <script>
        // Add interactive features
        document.querySelectorAll('.test-item').forEach(item => {
            item.addEventListener('click', function() {
                // Could expand to show more details
                console.log('Test clicked:', this.querySelector('.test-name').textContent);
            });
        });
        
        // Animate numbers on load
        document.querySelectorAll('.summary-card .number').forEach(elem => {
            const target = parseInt(elem.textContent);
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                elem.textContent = Math.floor(current);
            }, 20);
        });
    </script>
</body>
</html>`;

function getOverallStatusClass(status) {
    switch(status) {
        case 'SUCCESS':
        case 'SUCCESS_WITH_WARNINGS':
            return 'success';
        case 'PARTIAL_SUCCESS':
            return 'warning';
        case 'FAILED':
            return 'failed';
        default:
            return 'warning';
    }
}

function generateTestCategories(tests) {
    const categories = {
        infrastructure: 'Infrastructure',
        server: 'Server',
        api: 'API Endpoints',
        database: 'Database',
        frontend: 'Frontend',
        websocket: 'WebSocket',
        aiml: 'AI/ML',
        security: 'Security',
        performance: 'Performance'
    };
    
    let html = '';
    
    for (const [prefix, categoryName] of Object.entries(categories)) {
        const categoryTests = Object.entries(tests).filter(([name, _]) => 
            name.toLowerCase().includes(prefix)
        );
        
        if (categoryTests.length > 0) {
            html += `
            <div class="test-category">
                <h3>${getIcon(categoryTests)} ${categoryName}</h3>
                ${categoryTests.map(([name, status]) => `
                    <div class="test-item">
                        <span class="test-name">${formatTestName(name)}</span>
                        <span class="test-status ${getStatusClass(status)}">${getStatusText(status)}</span>
                    </div>
                `).join('')}
            </div>`;
        }
    }
    
    return html;
}

function generateDetailedApiResults(apiDetails) {
    if (!apiDetails || !apiDetails.details) return '';
    
    return `
    <div class="tests-section">
        <h2>Detailed API Test Results</h2>
        <div class="test-category">
            <h3>API Endpoint Performance</h3>
            ${apiDetails.details.map(test => `
                <div class="test-item">
                    <span class="test-name">${test.endpoint}</span>
                    <span class="test-status ${test.passed ? 'passed' : 'failed'}">
                        ${test.status || test.error} ${test.responseTime ? `(${test.responseTime})` : ''}
                    </span>
                </div>
            `).join('')}
        </div>
    </div>`;
}

function formatTestName(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getStatusClass(status) {
    if (typeof status === 'string') {
        if (status === 'PASSED') return 'passed';
        if (status === 'WARNING') return 'warning';
        if (status.startsWith('FAILED')) return 'failed';
    }
    return 'warning';
}

function getStatusText(status) {
    if (typeof status === 'string') {
        if (status === 'PASSED') return '✓ Passed';
        if (status === 'WARNING') return '⚠ Warning';
        if (status.startsWith('FAILED')) return '✗ Failed';
    }
    return status;
}

function getIcon(tests) {
    const hasFailure = tests.some(([_, status]) => 
        typeof status === 'string' && status.startsWith('FAILED')
    );
    const hasWarning = tests.some(([_, status]) => 
        status === 'WARNING'
    );
    
    if (hasFailure) return '❌';
    if (hasWarning) return '⚠️';
    return '✅';
}

// Output the HTML
console.log(html);