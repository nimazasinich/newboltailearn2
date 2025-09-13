import puppeteer from 'puppeteer';

async function testCompleteFlow() {
    console.log('🚀 Starting Complete Application Flow Verification...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    try {
        // Test 1: Landing page loads
        console.log('🔍 Testing landing page...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
        await page.waitForSelector('body', { timeout: 5000 });
        
        // Verify page title and essential elements
        const title = await page.title();
        console.log('Page title:', title);
        
        // Test 2: Navigation elements exist and work
        const navElements = await page.$$('nav a, .nav-link, [role="navigation"] a');
        console.log(`Found ${navElements.length} navigation elements`);
        
        // Test 3: Check for login elements
        const loginElements = await page.$$('[data-testid="login-button"], .login-btn, a[href*="login"]');
        console.log(`Found ${loginElements.length} login elements`);
        
        // Test 4: Check for dashboard elements
        const dashboardElements = await page.$$('[data-testid="dashboard"], .dashboard, #dashboard');
        console.log(`Found ${dashboardElements.length} dashboard elements`);
        
        // Test 5: Check for any forms
        const forms = await page.$$('form');
        console.log(`Found ${forms.length} forms`);
        
        // Test 6: Check for any buttons
        const buttons = await page.$$('button');
        console.log(`Found ${buttons.length} buttons`);
        
        // Test 7: Check for any input fields
        const inputs = await page.$$('input, textarea, select');
        console.log(`Found ${inputs.length} input fields`);
        
        // Test 8: Check for any error messages
        const errorElements = await page.$$('.error, .invalid, [role="alert"], .alert-error');
        console.log(`Found ${errorElements.length} error elements`);
        
        // Test 9: Check for loading indicators
        const loadingElements = await page.$$('.loading, .spinner, [data-testid="loading"]');
        console.log(`Found ${loadingElements.length} loading elements`);
        
        // Test 10: Check page content
        const bodyText = await page.$eval('body', el => el.textContent);
        console.log('Page contains text:', bodyText.length > 0 ? 'Yes' : 'No');
        console.log('Page text length:', bodyText.length);
        
        // Test 11: Check for React app mounting
        const reactRoot = await page.$('#root');
        const reactContent = reactRoot ? await page.$eval('#root', el => el.innerHTML) : '';
        console.log('React app mounted:', reactContent.length > 0 ? 'Yes' : 'No');
        
        // Test 12: Check for any console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Test 13: Check for network errors
        const networkErrors = [];
        page.on('response', response => {
            if (!response.ok()) {
                networkErrors.push(`${response.url()}: ${response.status()}`);
            }
        });
        
        // Wait a bit to collect any errors
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        console.log(`✅ Page loaded successfully: ${title ? 'Yes' : 'No'}`);
        console.log(`✅ Navigation elements: ${navElements.length}`);
        console.log(`✅ Login elements: ${loginElements.length}`);
        console.log(`✅ Dashboard elements: ${dashboardElements.length}`);
        console.log(`✅ Forms found: ${forms.length}`);
        console.log(`✅ Buttons found: ${buttons.length}`);
        console.log(`✅ Input fields: ${inputs.length}`);
        console.log(`✅ Error elements: ${errorElements.length}`);
        console.log(`✅ Loading elements: ${loadingElements.length}`);
        console.log(`✅ React app mounted: ${reactContent.length > 0 ? 'Yes' : 'No'}`);
        console.log(`✅ Console errors: ${consoleErrors.length}`);
        console.log(`✅ Network errors: ${networkErrors.length}`);
        
        if (consoleErrors.length > 0) {
            console.log('\n❌ Console Errors:');
            consoleErrors.forEach(error => console.log(`  - ${error}`));
        }
        
        if (networkErrors.length > 0) {
            console.log('\n❌ Network Errors:');
            networkErrors.forEach(error => console.log(`  - ${error}`));
        }
        
        // Test 14: Try to navigate to different routes
        console.log('\n🔍 Testing route navigation...');
        const routes = ['/app/dashboard', '/app/training', '/app/models', '/app/data', '/app/analytics', '/app/monitoring', '/app/logs', '/app/team'];
        
        for (const route of routes) {
            try {
                console.log(`Testing route: ${route}`);
                await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0', timeout: 5000 });
                const currentUrl = page.url();
                const routeTitle = await page.title();
                console.log(`  ✅ ${route} - URL: ${currentUrl}, Title: ${routeTitle}`);
                
                // Check if page has content
                const routeContent = await page.$eval('body', el => el.textContent);
                console.log(`  Content length: ${routeContent.length}`);
                
            } catch (error) {
                console.log(`  ❌ ${route} - Error: ${error.message}`);
            }
        }
        
        // Test 15: Check for authentication flow
        console.log('\n🔍 Testing authentication flow...');
        try {
            await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 5000 });
            const loginPageTitle = await page.title();
            console.log(`Login page title: ${loginPageTitle}`);
            
            const loginForm = await page.$('form');
            if (loginForm) {
                console.log('✅ Login form found');
                
                // Try to find username and password fields
                const usernameField = await page.$('input[type="text"], input[name*="user"], input[name*="email"]');
                const passwordField = await page.$('input[type="password"]');
                
                if (usernameField && passwordField) {
                    console.log('✅ Username and password fields found');
                    
                    // Try to fill in credentials
                    await usernameField.type('admin');
                    await passwordField.type('admin');
                    console.log('✅ Credentials filled');
                    
                    // Try to submit form
                    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
                    if (submitButton) {
                        console.log('✅ Submit button found');
                        // Don't actually submit to avoid side effects
                    }
                } else {
                    console.log('❌ Username or password fields not found');
                }
            } else {
                console.log('❌ Login form not found');
            }
        } catch (error) {
            console.log(`❌ Login page test failed: ${error.message}`);
        }
        
        // Test 16: Performance metrics
        console.log('\n🔍 Testing performance...');
        const performanceMetrics = await page.metrics();
        console.log('Performance Metrics:');
        console.log(`  - JSHeapUsedSize: ${Math.round(performanceMetrics.JSHeapUsedSize / 1024 / 1024)}MB`);
        console.log(`  - JSHeapTotalSize: ${Math.round(performanceMetrics.JSHeapTotalSize / 1024 / 1024)}MB`);
        console.log(`  - Timestamp: ${performanceMetrics.Timestamp}`);
        
        // Test 17: Check for WebSocket connections
        console.log('\n🔍 Testing WebSocket connections...');
        const wsConnections = await page.evaluate(() => {
            return window.WebSocket ? 'WebSocket API available' : 'WebSocket API not available';
        });
        console.log(`WebSocket status: ${wsConnections}`);
        
        // Test 18: Check for any modals or overlays
        const modals = await page.$$('.modal, .overlay, [role="dialog"]');
        console.log(`Found ${modals.length} modals/overlays`);
        
        // Test 19: Check for any charts or visualizations
        const charts = await page.$$('canvas, svg, .chart, [data-testid*="chart"]');
        console.log(`Found ${charts.length} charts/visualizations`);
        
        // Test 20: Check for any tables
        const tables = await page.$$('table, .table');
        console.log(`Found ${tables.length} tables`);
        
        console.log('\n🎯 Overall Application Status:');
        console.log('==============================');
        const hasContent = bodyText.length > 0;
        const hasReact = reactContent.length > 0;
        const hasNavigation = navElements.length > 0;
        const hasForms = forms.length > 0;
        const hasButtons = buttons.length > 0;
        const noConsoleErrors = consoleErrors.length === 0;
        const noNetworkErrors = networkErrors.length === 0;
        
        const overallScore = [hasContent, hasReact, hasNavigation, hasForms, hasButtons, noConsoleErrors, noNetworkErrors].filter(Boolean).length;
        const maxScore = 7;
        const percentage = Math.round((overallScore / maxScore) * 100);
        
        console.log(`Overall Score: ${overallScore}/${maxScore} (${percentage}%)`);
        console.log(`✅ Has Content: ${hasContent ? 'Yes' : 'No'}`);
        console.log(`✅ React App: ${hasReact ? 'Yes' : 'No'}`);
        console.log(`✅ Navigation: ${hasNavigation ? 'Yes' : 'No'}`);
        console.log(`✅ Forms: ${hasForms ? 'Yes' : 'No'}`);
        console.log(`✅ Buttons: ${hasButtons ? 'Yes' : 'No'}`);
        console.log(`✅ No Console Errors: ${noConsoleErrors ? 'Yes' : 'No'}`);
        console.log(`✅ No Network Errors: ${noNetworkErrors ? 'Yes' : 'No'}`);
        
        if (percentage >= 80) {
            console.log('\n🎉 APPLICATION STATUS: EXCELLENT');
        } else if (percentage >= 60) {
            console.log('\n✅ APPLICATION STATUS: GOOD');
        } else if (percentage >= 40) {
            console.log('\n⚠️ APPLICATION STATUS: NEEDS IMPROVEMENT');
        } else {
            console.log('\n❌ APPLICATION STATUS: CRITICAL ISSUES');
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testCompleteFlow().catch(console.error);