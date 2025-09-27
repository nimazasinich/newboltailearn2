#!/bin/bash
set -e

# Database initialization script
# This script initializes the SQLite database with proper schema and permissions

echo "🗄️  Initializing SQLite database..."

# Create data directory if it doesn't exist
mkdir -p /data

# Set proper permissions
chmod 755 /data

# Check if database file exists
if [ ! -f "/data/app.sqlite" ]; then
    echo "📝 Creating new database file..."
    
    # Create empty database file
    touch /data/app.sqlite
    chmod 664 /data/app.sqlite
    
    # Initialize with basic schema if schema file exists
    if [ -f "/app/server/database/schema.sql" ]; then
        echo "📋 Applying database schema..."
        sqlite3 /data/app.sqlite < /app/server/database/schema.sql
    fi
    
    # Run migrations if they exist
    if [ -f "/app/server/database/migrate.js" ]; then
        echo "🔄 Running database migrations..."
        cd /app && node server/database/migrate.js
    fi
    
    # Seed database if seed file exists
    if [ -f "/app/server/database/seed.js" ]; then
        echo "🌱 Seeding database..."
        cd /app && node server/database/seed.js
    fi
    
    echo "✅ Database initialized successfully"
else
    echo "✅ Database file already exists"
fi

# Verify database is accessible
echo "🔍 Verifying database access..."
sqlite3 /data/app.sqlite "SELECT 1;" > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database verification successful"
else
    echo "❌ Database verification failed"
    exit 1
fi

# Set final permissions
chown -R appuser:appuser /data 2>/dev/null || true

echo "🎉 Database initialization complete"