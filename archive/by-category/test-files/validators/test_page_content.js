import puppeteer from 'puppeteer';

async function testPageContent() {
    console.log('🔍 Analyzing Page Content and Component Structure...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 720 });
    
    try {
        // Test different routes to see what's actually being rendered
        const routes = [
            { path: '/', name: 'Root' },
            { path: '/app/dashboard', name: 'Dashboard' },
            { path: '/app/training', name: 'Training' },
            { path: '/app/models', name: 'Models' },
            { path: '/app/data', name: 'Data' },
            { path: '/app/analytics', name: 'Analytics' },
            { path: '/app/monitoring', name: 'Monitoring' },
            { path: '/app/logs', name: 'Logs' },
            { path: '/app/team', name: 'Team' },
            { path: '/login', name: 'Login' }
        ];
        
        for (const route of routes) {
            console.log(`\n🔍 Testing ${route.name} (${route.path})...`);
            
            try {
                await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle0', timeout: 10000 });
                
                const currentUrl = page.url();
                const title = await page.title();
                
                console.log(`  URL: ${currentUrl}`);
                console.log(`  Title: ${title}`);
                
                // Get the actual HTML content
                const htmlContent = await page.$eval('#root', el => el.innerHTML);
                console.log(`  HTML Content Length: ${htmlContent.length}`);
                
                // Check for specific components
                const hasLoading = htmlContent.includes('loading') || htmlContent.includes('Loading');
                const hasError = htmlContent.includes('error') || htmlContent.includes('Error');
                const hasAuth = htmlContent.includes('auth') || htmlContent.includes('login') || htmlContent.includes('Login');
                const hasDashboard = htmlContent.includes('dashboard') || htmlContent.includes('Dashboard');
                const hasTraining = htmlContent.includes('training') || htmlContent.includes('Training');
                const hasModels = htmlContent.includes('model') || htmlContent.includes('Model');
                
                console.log(`  Has Loading: ${hasLoading}`);
                console.log(`  Has Error: ${hasError}`);
                console.log(`  Has Auth: ${hasAuth}`);
                console.log(`  Has Dashboard: ${hasDashboard}`);
                console.log(`  Has Training: ${hasTraining}`);
                console.log(`  Has Models: ${hasModels}`);
                
                // Get visible text content
                const visibleText = await page.$eval('body', el => el.innerText);
                console.log(`  Visible Text Length: ${visibleText.length}`);
                console.log(`  Visible Text Preview: ${visibleText.substring(0, 200)}...`);
                
                // Check for any error messages in console
                const consoleErrors = [];
                page.on('console', msg => {
                    if (msg.type() === 'error') {
                        consoleErrors.push(msg.text());
                    }
                });
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (consoleErrors.length > 0) {
                    console.log(`  Console Errors: ${consoleErrors.length}`);
                    consoleErrors.forEach(error => console.log(`    - ${error}`));
                }
                
            } catch (error) {
                console.log(`  ❌ Error: ${error.message}`);
            }
        }
        
        // Test specific component rendering
        console.log('\n🔍 Testing Component Rendering...');
        
        await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle0', timeout: 10000 });
        
        // Check for React components by looking at data attributes and class names
        const reactComponents = await page.evaluate(() => {
            const elements = document.querySelectorAll('[data-testid], [class*="component"], [class*="Component"]');
            return Array.from(elements).map(el => ({
                tagName: el.tagName,
                className: el.className,
                testId: el.getAttribute('data-testid'),
                textContent: el.textContent?.substring(0, 100)
            }));
        });
        
        console.log(`Found ${reactComponents.length} potential React components:`);
        reactComponents.forEach((comp, index) => {
            console.log(`  ${index + 1}. ${comp.tagName} - ${comp.className} - ${comp.testId}`);
            if (comp.textContent) {
                console.log(`     Text: ${comp.textContent}`);
            }
        });
        
        // Check for any loading states
        console.log('\n🔍 Checking for Loading States...');
        
        const loadingStates = await page.evaluate(() => {
            const loadingElements = document.querySelectorAll('.loading, .spinner, [data-testid*="loading"], [class*="loading"], [class*="Loading"]');
            return Array.from(loadingElements).map(el => ({
                tagName: el.tagName,
                className: el.className,
                textContent: el.textContent,
                isVisible: el.offsetParent !== null
            }));
        });
        
        console.log(`Found ${loadingStates.length} loading elements:`);
        loadingStates.forEach((loading, index) => {
            console.log(`  ${index + 1}. ${loading.tagName} - ${loading.className} - Visible: ${loading.isVisible}`);
            if (loading.textContent) {
                console.log(`     Text: ${loading.textContent}`);
            }
        });
        
        // Check for authentication states
        console.log('\n🔍 Checking Authentication States...');
        
        const authStates = await page.evaluate(() => {
            const authElements = document.querySelectorAll('[data-testid*="auth"], [class*="auth"], [class*="Auth"], [class*="login"], [class*="Login"]');
            return Array.from(authElements).map(el => ({
                tagName: el.tagName,
                className: el.className,
                textContent: el.textContent?.substring(0, 100),
                isVisible: el.offsetParent !== null
            }));
        });
        
        console.log(`Found ${authStates.length} authentication elements:`);
        authStates.forEach((auth, index) => {
            console.log(`  ${index + 1}. ${auth.tagName} - ${auth.className} - Visible: ${auth.isVisible}`);
            if (auth.textContent) {
                console.log(`     Text: ${auth.textContent}`);
            }
        });
        
        // Check for any error boundaries or error states
        console.log('\n🔍 Checking for Error States...');
        
        const errorStates = await page.evaluate(() => {
            const errorElements = document.querySelectorAll('.error, .Error, [data-testid*="error"], [class*="error"], [class*="Error"]');
            return Array.from(errorElements).map(el => ({
                tagName: el.tagName,
                className: el.className,
                textContent: el.textContent?.substring(0, 100),
                isVisible: el.offsetParent !== null
            }));
        });
        
        console.log(`Found ${errorStates.length} error elements:`);
        errorStates.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.tagName} - ${error.className} - Visible: ${error.isVisible}`);
            if (error.textContent) {
                console.log(`     Text: ${error.textContent}`);
            }
        });
        
        // Final analysis
        console.log('\n🎯 Page Content Analysis Summary:');
        console.log('==================================');
        
        const hasReactComponents = reactComponents.length > 0;
        const hasLoadingStates = loadingStates.length > 0;
        const hasAuthStates = authStates.length > 0;
        const hasErrorStates = errorStates.length > 0;
        
        console.log(`✅ React Components Found: ${hasReactComponents ? 'Yes' : 'No'} (${reactComponents.length})`);
        console.log(`✅ Loading States: ${hasLoadingStates ? 'Yes' : 'No'} (${loadingStates.length})`);
        console.log(`✅ Auth States: ${hasAuthStates ? 'Yes' : 'No'} (${authStates.length})`);
        console.log(`✅ Error States: ${hasErrorStates ? 'Yes' : 'No'} (${errorStates.length})`);
        
        if (hasLoadingStates) {
            console.log('\n⚠️ Application appears to be in a loading state');
        }
        
        if (hasAuthStates) {
            console.log('\n🔐 Authentication components detected');
        }
        
        if (hasErrorStates) {
            console.log('\n❌ Error states detected');
        }
        
        if (!hasReactComponents && !hasLoadingStates && !hasAuthStates && !hasErrorStates) {
            console.log('\n🤔 Application may be showing a minimal or empty state');
        }
        
    } catch (error) {
        console.error('❌ Page content test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testPageContent().catch(console.error);