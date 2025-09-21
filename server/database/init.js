import DatabaseManager from './DatabaseManager.js';

/**
 * Legacy database initialization function - now uses DatabaseManager singleton
 * @deprecated Use DatabaseManager.initialize() directly
 */
async function initializeDatabase() {
    try {
        console.log('Initializing database using DatabaseManager singleton...');
        
        await DatabaseManager.initialize();
        
        console.log('Database initialized successfully');
        
        // Test database
        const stats = DatabaseManager.getStats();
        console.log('Database stats:', stats);
        
        return true;
    } catch (error) {
        console.error('Database initialization failed:', error);
        return false;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    initializeDatabase();
}

export { initializeDatabase };
