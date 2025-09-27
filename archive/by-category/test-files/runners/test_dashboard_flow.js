import puppeteer from 'puppeteer';

async function testDashboardFlow() {
    console.log('🎯 Testing Dashboard Functionality and Page Navigation...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 720 });
    
    try {
        // Test 1: Navigate to dashboard
        console.log('🔍 Testing Dashboard Access...');
        await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle0', timeout: 10000 });
        
        // Check if we're redirected to login (authentication required)
        const currentUrl = page.url();
        console.log(`Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/login')) {
            console.log('✅ Authentication required - redirected to login');
            
            // Test login form
            const loginForm = await page.$('form');
            if (loginForm) {
                console.log('✅ Login form found');
                
                // Try to find and fill login fields
                const usernameField = await page.$('input[type="text"], input[name*="user"], input[name*="email"]');
                const passwordField = await page.$('input[type="password"]');
                
                if (usernameField && passwordField) {
                    await usernameField.type('admin');
                    await passwordField.type('admin');
                    console.log('✅ Login credentials filled');
                    
                    // Try to submit (but don't actually submit to avoid side effects)
                    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
                    if (submitButton) {
                        console.log('✅ Submit button found');
                    }
                }
            }
        } else {
            console.log('✅ Dashboard accessible without authentication');
        }
        
        // Test 2: Check for dashboard components
        console.log('\n🔍 Testing Dashboard Components...');
        
        // Look for common dashboard elements
        const dashboardSelectors = [
            '[data-testid="dashboard"]',
            '.dashboard',
            '#dashboard',
            '[data-testid="overview"]',
            '.overview',
            '[data-testid="training-management"]',
            '.training-management',
            '[data-testid="metrics"]',
            '.metrics',
            '[data-testid="widget"]',
            '.widget',
            '.card',
            '.chart',
            'canvas',
            'svg'
        ];
        
        let dashboardElements = 0;
        for (const selector of dashboardSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
                dashboardElements += elements.length;
            }
        }
        
        console.log(`Total dashboard elements found: ${dashboardElements}`);
        
        // Test 3: Check for navigation elements
        console.log('\n🔍 Testing Navigation Elements...');
        
        const navSelectors = [
            'nav',
            '.nav',
            '[role="navigation"]',
            '.sidebar',
            '.menu',
            '.navbar',
            'header',
            '.header'
        ];
        
        let navElements = 0;
        for (const selector of navSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                console.log(`✅ Found ${elements.length} navigation elements: ${selector}`);
                navElements += elements.length;
            }
        }
        
        // Test 4: Check for interactive elements
        console.log('\n🔍 Testing Interactive Elements...');
        
        const buttons = await page.$$('button');
        const links = await page.$$('a');
        const inputs = await page.$$('input, textarea, select');
        const forms = await page.$$('form');
        
        console.log(`✅ Buttons: ${buttons.length}`);
        console.log(`✅ Links: ${links.length}`);
        console.log(`✅ Input fields: ${inputs.length}`);
        console.log(`✅ Forms: ${forms.length}`);
        
        // Test 5: Check for data display elements
        console.log('\n🔍 Testing Data Display Elements...');
        
        const tables = await page.$$('table, .table');
        const lists = await page.$$('ul, ol, .list');
        const cards = await page.$$('.card, .panel, .box');
        const charts = await page.$$('canvas, svg, .chart');
        
        console.log(`✅ Tables: ${tables.length}`);
        console.log(`✅ Lists: ${lists.length}`);
        console.log(`✅ Cards: ${cards.length}`);
        console.log(`✅ Charts: ${charts.length}`);
        
        // Test 6: Check for loading and error states
        console.log('\n🔍 Testing Loading and Error States...');
        
        const loadingElements = await page.$$('.loading, .spinner, [data-testid="loading"]');
        const errorElements = await page.$$('.error, .invalid, [role="alert"], .alert-error');
        const successElements = await page.$$('.success, .valid, .alert-success');
        
        console.log(`✅ Loading elements: ${loadingElements.length}`);
        console.log(`✅ Error elements: ${errorElements.length}`);
        console.log(`✅ Success elements: ${successElements.length}`);
        
        // Test 7: Check page content and structure
        console.log('\n🔍 Testing Page Content...');
        
        const bodyText = await page.$eval('body', el => el.textContent);
        const hasContent = bodyText.length > 0;
        const reactRoot = await page.$('#root');
        const reactContent = reactRoot ? await page.$eval('#root', el => el.innerHTML) : '';
        const hasReact = reactContent.length > 0;
        
        console.log(`✅ Has content: ${hasContent} (${bodyText.length} characters)`);
        console.log(`✅ React app mounted: ${hasReact} (${reactContent.length} characters)`);
        
        // Test 8: Check for specific dashboard features
        console.log('\n🔍 Testing Specific Dashboard Features...');
        
        // Look for training-related elements
        const trainingElements = await page.$$('[data-testid*="training"], .training, [class*="training"]');
        console.log(`✅ Training elements: ${trainingElements.length}`);
        
        // Look for model-related elements
        const modelElements = await page.$$('[data-testid*="model"], .model, [class*="model"]');
        console.log(`✅ Model elements: ${modelElements.length}`);
        
        // Look for analytics elements
        const analyticsElements = await page.$$('[data-testid*="analytics"], .analytics, [class*="analytics"]');
        console.log(`✅ Analytics elements: ${analyticsElements.length}`);
        
        // Look for monitoring elements
        const monitoringElements = await page.$$('[data-testid*="monitoring"], .monitoring, [class*="monitoring"]');
        console.log(`✅ Monitoring elements: ${monitoringElements.length}`);
        
        // Test 9: Check for real-time features
        console.log('\n🔍 Testing Real-time Features...');
        
        const wsStatus = await page.evaluate(() => {
            return window.WebSocket ? 'WebSocket API available' : 'WebSocket API not available';
        });
        console.log(`✅ WebSocket API: ${wsStatus}`);
        
        // Look for real-time indicators
        const realtimeElements = await page.$$('[data-testid*="realtime"], .realtime, [class*="realtime"], .live, .streaming');
        console.log(`✅ Real-time elements: ${realtimeElements.length}`);
        
        // Test 10: Performance check
        console.log('\n🔍 Testing Performance...');
        
        const performanceMetrics = await page.metrics();
        console.log(`✅ JS Heap Used: ${Math.round(performanceMetrics.JSHeapUsedSize / 1024 / 1024)}MB`);
        console.log(`✅ JS Heap Total: ${Math.round(performanceMetrics.JSHeapTotalSize / 1024 / 1024)}MB`);
        
        // Test 11: Check for console errors
        console.log('\n🔍 Testing Console Errors...');
        
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`✅ Console errors: ${consoleErrors.length}`);
        if (consoleErrors.length > 0) {
            console.log('Console errors found:');
            consoleErrors.forEach(error => console.log(`  - ${error}`));
        }
        
        // Test 12: Overall assessment
        console.log('\n🎯 Dashboard Test Results:');
        console.log('==========================');
        
        const hasDashboardElements = dashboardElements > 0;
        const hasNavigation = navElements > 0;
        const hasInteractiveElements = (buttons.length + links.length + inputs.length) > 0;
        const hasDataDisplay = (tables.length + lists.length + cards.length + charts.length) > 0;
        const hasPageContent = bodyText.length > 0;
        const hasReactApp = reactContent.length > 0;
        const noConsoleErrors = consoleErrors.length === 0;
        
        const score = [hasDashboardElements, hasNavigation, hasInteractiveElements, hasDataDisplay, hasPageContent, hasReactApp, noConsoleErrors].filter(Boolean).length;
        const maxScore = 7;
        const percentage = Math.round((score / maxScore) * 100);
        
        console.log(`Overall Score: ${score}/${maxScore} (${percentage}%)`);
        console.log(`✅ Dashboard Elements: ${hasDashboardElements ? 'Yes' : 'No'} (${dashboardElements})`);
        console.log(`✅ Navigation: ${hasNavigation ? 'Yes' : 'No'} (${navElements})`);
        console.log(`✅ Interactive Elements: ${hasInteractiveElements ? 'Yes' : 'No'} (${buttons.length + links.length + inputs.length})`);
        console.log(`✅ Data Display: ${hasDataDisplay ? 'Yes' : 'No'} (${tables.length + lists.length + cards.length + charts.length})`);
        console.log(`✅ Content: ${hasPageContent ? 'Yes' : 'No'} (${bodyText.length} chars)`);
        console.log(`✅ React App: ${hasReactApp ? 'Yes' : 'No'} (${reactContent.length} chars)`);
        console.log(`✅ No Console Errors: ${noConsoleErrors ? 'Yes' : 'No'}`);
        
        if (percentage >= 80) {
            console.log('\n🎉 DASHBOARD STATUS: EXCELLENT');
        } else if (percentage >= 60) {
            console.log('\n✅ DASHBOARD STATUS: GOOD');
        } else if (percentage >= 40) {
            console.log('\n⚠️ DASHBOARD STATUS: NEEDS IMPROVEMENT');
        } else {
            console.log('\n❌ DASHBOARD STATUS: CRITICAL ISSUES');
        }
        
    } catch (error) {
        console.error('❌ Dashboard test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testDashboardFlow().catch(console.error);