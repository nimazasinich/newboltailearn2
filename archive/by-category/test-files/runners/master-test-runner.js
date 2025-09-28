// master-test-runner.js - Complete test suite with Git integration
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all test runners and safety functions
import { healEnvironment } from './env-healer.js';
import { healDatabase } from './db-healer.js';
import { runIntegrationTestsWithHealing } from './integration-test-runner.js';
import { runE2ETestsWithHealing } from './e2e-test-runner.js';
import { runStressTestsWithHealing } from './stress-test-runner.js';
import { 
    getCurrentBranch, 
    isGitClean, 
    createBackupBranch, 
    safeTestCommit, 
    restoreFromBackup, 
    getGitInfo, 
    validateGitSafety 
} from './git-safety.js';

async function healEnvironmentPhase() {
    console.log('📋 Phase 1: Environment Preparation');
    console.log('=' .repeat(50));
    
    try {
        const envResult = await healEnvironment();
        console.log('✅ Environment healing completed');
        
        const dbResult = await healDatabase();
        console.log('✅ Database healing completed');
        
        return {
            success: true,
            environment: envResult,
            database: dbResult,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Environment healing failed:', error.message);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

async function runCompleteTestSuite() {
    console.log('🚀 Starting Complete Test Suite Validation');
    console.log('=' .repeat(60));
    
    const results = {
        startTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'test',
        phases: {},
        summary: {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            healingActions: []
        },
        gitOperations: {}
    };
    
    // Git safety setup
    console.log('\n🔍 Git Safety Validation');
    const gitSafety = validateGitSafety();
    results.gitOperations.originalBranch = getCurrentBranch();
    results.gitOperations.isClean = isGitClean();
    results.gitOperations.gitInfo = gitSafety.gitInfo;
    
    if (results.gitOperations.isClean) {
        console.log('✅ Working directory is clean');
    } else {
        console.log('⚠️  Working directory has changes, creating backup...');
        results.gitOperations.backupBranch = createBackupBranch();
    }
    
    try {
        // Phase 1: Environment Healing
        console.log('\n📋 Phase 1: Environment Preparation');
        results.phases.environmentHealing = await healEnvironmentPhase();
        
        if (!results.phases.environmentHealing.success) {
            throw new Error('Environment healing failed');
        }
        
        // Phase 2: Integration Tests
        console.log('\n🧪 Phase 2: Integration Tests');
        try {
            results.phases.integration = await runIntegrationTestsWithHealing();
            results.summary.passedTests++;
        } catch (error) {
            results.phases.integration = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            results.summary.failedTests++;
        }
        results.summary.totalTests++;
        
        // Phase 3: E2E Tests
        console.log('\n🎭 Phase 3: End-to-End Tests');
        try {
            results.phases.e2e = await runE2ETestsWithHealing();
            results.summary.passedTests++;
        } catch (error) {
            results.phases.e2e = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            results.summary.failedTests++;
        }
        results.summary.totalTests++;
        
        // Phase 4: Stress Tests
        console.log('\n💪 Phase 4: Stress Tests');
        try {
            results.phases.stress = await runStressTestsWithHealing();
            results.summary.passedTests++;
        } catch (error) {
            results.phases.stress = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            results.summary.failedTests++;
        }
        results.summary.totalTests++;
        
        // Phase 5: Final Summary and Git Operations
        console.log('\n📊 Phase 5: Final Summary');
        results.endTime = new Date().toISOString();
        results.success = results.summary.failedTests === 0;
        
        // Safe Git commit if all tests passed
        if (results.success && results.gitOperations.isClean) {
            console.log('\n🔧 Creating test commit...');
            results.gitOperations.commit = safeTestCommit();
        }
        
        // Generate final report
        generateFinalReport(results);
        
        if (results.success) {
            console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
            console.log(`✅ ${results.summary.passedTests}/${results.summary.totalTests} test phases passed`);
        } else {
            console.log('\n⚠️  SOME TESTS FAILED');
            console.log(`❌ ${results.summary.failedTests}/${results.summary.totalTests} test phases failed`);
        }
        
        return results;
        
    } catch (error) {
        results.endTime = new Date().toISOString();
        results.success = false;
        results.error = error.message;
        
        // Restore original state if tests failed
        if (results.gitOperations.backupBranch) {
            console.log('\n🔧 Restoring from backup due to test failures...');
            restoreFromBackup(results.gitOperations.backupBranch);
        }
        
        generateFinalReport(results);
        
        console.error('\n❌ Test suite failed:', error.message);
        throw error;
    }
}

function generateFinalReport(results) {
    const duration = new Date(results.endTime) - new Date(results.startTime);
    const durationMinutes = Math.floor(duration / 60000);
    const durationSeconds = Math.floor((duration % 60000) / 1000);
    
    const report = `# Persian Legal AI - Test Validation Report

**Generated:** ${new Date().toISOString()}
**Duration:** ${durationMinutes}m ${durationSeconds}s
**Status:** ${results.success ? '✅ SUCCESS' : '❌ FAILED'}

## Test Summary
- **Total Test Phases:** ${results.summary.totalTests}
- **Passed:** ${results.summary.passedTests}
- **Failed:** ${results.summary.failedTests}
- **Success Rate:** ${results.summary.totalTests > 0 ? Math.round((results.summary.passedTests / results.summary.totalTests) * 100) : 0}%

## Git Operations
- **Original Branch:** ${results.gitOperations.originalBranch}
- **Clean Workspace:** ${results.gitOperations.isClean ? '✅' : '❌'}
- **Backup Created:** ${results.gitOperations.backupBranch ? '✅' : '❌'}
- **Test Commit:** ${results.gitOperations.commit?.committed ? '✅' : '❌'}

## Detailed Results

### Environment Healing
${results.phases.environmentHealing?.success ? '✅ PASSED' : '❌ FAILED'}
${results.phases.environmentHealing?.environment ? `- Environment Variables: ${results.phases.environmentHealing.environment.variablesCount}` : ''}
${results.phases.environmentHealing?.database ? `- Database Tables: ${results.phases.environmentHealing.database.tablesCount || 'N/A'}` : ''}

### Integration Tests
${results.phases.integration?.success !== false ? '✅ PASSED' : '❌ FAILED'}
${results.phases.integration?.exitCode ? `- Exit Code: ${results.phases.integration.exitCode}` : ''}
${results.phases.integration?.testFiles ? `- Test Files: ${results.phases.integration.testFiles}` : ''}

### End-to-End Tests
${results.phases.e2e?.success !== false ? '✅ PASSED' : '❌ FAILED'}
${results.phases.e2e?.exitCode ? `- Exit Code: ${results.phases.e2e.exitCode}` : ''}
${results.phases.e2e?.csrfToken ? `- CSRF Token: ${results.phases.e2e.csrfToken}` : ''}
${results.phases.e2e?.adminSeeded ? `- Admin Seeded: ${results.phases.e2e.adminSeeded}` : ''}

### Stress Tests
${results.phases.stress?.success !== false ? '✅ PASSED' : '❌ FAILED'}
${results.phases.stress?.exitCode ? `- Exit Code: ${results.phases.stress.exitCode}` : ''}
${results.phases.stress?.testFiles ? `- Test Files: ${results.phases.stress.testFiles}` : ''}

## Healing Actions
${results.summary.healingActions.length > 0 ? 
    results.summary.healingActions.map(action => `- ${action}`).join('\n') : 
    'No healing actions were required'}

## Test Results Files
- Integration Tests: \`test-results-integration.json\`
- E2E Tests: \`test-results-e2e.json\`
- Stress Tests: \`test-results-stress.json\`

## Raw Results Data
\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`

---
**Report generated by Cursor Agent Test Validator**
**Test Framework:** Vitest + Playwright + Custom Self-Healing
**Validation Level:** Comprehensive with Real Data
**Git Integration:** Safe with Backup Branches
`;

    fs.writeFileSync('FINAL-TEST-REPORT.md', report);
    console.log('\n📋 Final report saved to FINAL-TEST-REPORT.md');
    
    // Also save raw results
    fs.writeFileSync('test-results-complete.json', JSON.stringify(results, null, 2));
    console.log('📊 Raw results saved to test-results-complete.json');
}

// Export for use in other modules
export { runCompleteTestSuite, generateFinalReport };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runCompleteTestSuite()
        .then(results => {
            console.log('\n🎯 Test suite execution completed');
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 Test suite execution failed:', error.message);
            process.exit(1);
        });
}