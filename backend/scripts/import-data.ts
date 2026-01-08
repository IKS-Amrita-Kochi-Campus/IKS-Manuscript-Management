/**
 * Database Import Script
 * 
 * This script imports data from JSON files into LOCAL MongoDB and PostgreSQL databases.
 * Run this script AFTER updating your .env to point to local databases.
 * 
 * Usage:
 *   1. Export data using: npx tsx scripts/export-data.ts (with remote credentials)
 *   2. Update .env with LOCAL database credentials
 *   3. Start local MongoDB and PostgreSQL services
 *   4. Run: npx tsx scripts/import-data.ts
 * 
 * Prerequisites:
 *   - Local MongoDB running (default: mongodb://localhost:27017)
 *   - Local PostgreSQL running (default: postgres://localhost:5432)
 *   - JSON export files exist in ./scripts/exports/
 */

import mongoose from 'mongoose';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPORT_DIR = path.join(__dirname, 'exports');

// Environment variables - should now point to LOCAL databases
const MONGODB_URI_LOG = process.env.MONGODB_URI_LOG || 'mongodb://localhost:27017/iks_log';
const MONGODB_URI_MANUSCRIPTS = process.env.MONGODB_URI_MANUSCRIPTS || 'mongodb://localhost:27017/manuscript';
const POSTGRESS_URI = process.env.POSTGRESS_URI || 'postgres://postgres:postgres@localhost:5432/iks';

/**
 * Read JSON file
 */
function readJsonFile<T>(fileName: string): T[] {
    const filePath = path.join(EXPORT_DIR, fileName);
    if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found: ${fileName} (skipping)`);
        return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Import data into MongoDB collection
 */
async function importMongoCollection(
    uri: string,
    collectionName: string,
    fileName: string
): Promise<number> {
    console.log(`\n📥 Importing MongoDB: ${collectionName}...`);

    const documents = readJsonFile<any>(fileName);
    if (documents.length === 0) {
        console.log(`   ⚠️  No documents to import`);
        return 0;
    }

    const connection = await mongoose.createConnection(uri).asPromise();

    try {
        const collection = connection.db!.collection(collectionName);

        // Clear existing data (optional - comment out if you want to merge)
        const deleteResult = await collection.deleteMany({});
        console.log(`   🗑️  Cleared ${deleteResult.deletedCount} existing documents`);

        // Insert new data
        const insertResult = await collection.insertMany(documents);
        console.log(`   ✅ Imported ${insertResult.insertedCount} documents`);

        return insertResult.insertedCount;
    } finally {
        await connection.close();
    }
}

/**
 * Create PostgreSQL tables (schema from database.ts)
 */
async function createPostgresTables(pool: pg.Pool): Promise<void> {
    console.log('\n📋 Creating PostgreSQL tables...');

    const createTablesQuery = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) DEFAULT 'VISITOR',
      institution VARCHAR(255),
      designation VARCHAR(255),
      research_interests TEXT,
      phone VARCHAR(50),
      address TEXT,
      is_email_verified BOOLEAN DEFAULT FALSE,
      email_verification_token VARCHAR(255),
      email_verification_expiry TIMESTAMP,
      password_reset_token VARCHAR(255),
      password_reset_expiry TIMESTAMP,
      verification_status VARCHAR(20) DEFAULT 'PENDING',
      identity_document_type VARCHAR(100),
      identity_document_hash VARCHAR(255),
      verified_at TIMESTAMP,
      verified_by UUID,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      last_login_at TIMESTAMP,
      last_login_ip VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token TEXT UNIQUE NOT NULL,
      ip_address VARCHAR(50) NOT NULL,
      user_agent TEXT,
      is_valid BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Access requests table
    CREATE TABLE IF NOT EXISTS access_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      manuscript_id VARCHAR(100) NOT NULL,
      requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      requested_level VARCHAR(20) NOT NULL,
      purpose TEXT NOT NULL,
      institution VARCHAR(255) NOT NULL,
      justification TEXT NOT NULL,
      duration INTEGER,
      status VARCHAR(20) DEFAULT 'PENDING',
      reviewer_id UUID REFERENCES users(id),
      reviewed_at TIMESTAMP,
      review_notes TEXT,
      approved_level VARCHAR(20),
      approved_duration INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Manuscript access (grants) table
    CREATE TABLE IF NOT EXISTS manuscript_access (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      manuscript_id VARCHAR(100) NOT NULL,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      access_level VARCHAR(20) NOT NULL,
      granted_by UUID NOT NULL REFERENCES users(id),
      granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      revoked_at TIMESTAMP,
      revoked_by UUID REFERENCES users(id),
      revoke_reason TEXT,
      watermark_id UUID UNIQUE NOT NULL,
      view_count INTEGER DEFAULT 0,
      download_count INTEGER DEFAULT 0,
      last_accessed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(manuscript_id, user_id)
    );

    -- Verification documents table
    CREATE TABLE IF NOT EXISTS verification_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      document_type VARCHAR(100) NOT NULL,
      document_hash VARCHAR(255) NOT NULL,
      encrypted_path VARCHAR(500) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      status VARCHAR(20) DEFAULT 'PENDING',
      review_notes TEXT,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      verified_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Bookmarks table
    CREATE TABLE IF NOT EXISTS bookmarks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      manuscript_id VARCHAR(100) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, manuscript_id)
    );

    -- App Settings table
    CREATE TABLE IF NOT EXISTS app_settings (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_by UUID REFERENCES users(id)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);
    CREATE INDEX IF NOT EXISTS idx_access_requests_manuscript_id ON access_requests(manuscript_id);
    CREATE INDEX IF NOT EXISTS idx_access_requests_requester_id ON access_requests(requester_id);
    CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
    CREATE INDEX IF NOT EXISTS idx_manuscript_access_manuscript_id ON manuscript_access(manuscript_id);
    CREATE INDEX IF NOT EXISTS idx_manuscript_access_user_id ON manuscript_access(user_id);
    CREATE INDEX IF NOT EXISTS idx_manuscript_access_watermark_id ON manuscript_access(watermark_id);
    CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_manuscript_id ON bookmarks(manuscript_id);
    `;

    await pool.query(createTablesQuery);
    console.log('   ✅ PostgreSQL tables created');
}

/**
 * Import data into PostgreSQL table
 */
async function importPostgresTable(
    pool: pg.Pool,
    tableName: string,
    fileName: string,
    idColumn: string = 'id'
): Promise<number> {
    console.log(`\n📥 Importing PostgreSQL: ${tableName}...`);

    const rows = readJsonFile<any>(fileName);
    if (rows.length === 0) {
        console.log(`   ⚠️  No rows to import`);
        return 0;
    }

    // Clear existing data (optional - comment out if you want to merge)
    // Skip clearing for app_settings as it has ON CONFLICT handling
    if (tableName !== 'app_settings') {
        const deleteResult = await pool.query(`DELETE FROM ${tableName}`);
        console.log(`   🗑️  Cleared ${deleteResult.rowCount || 0} existing rows`);
    }

    let importedCount = 0;

    for (const row of rows) {
        try {
            const columns = Object.keys(row);
            const values = Object.values(row);
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

            // Handle app_settings with upsert
            if (tableName === 'app_settings') {
                const query = `
                    INSERT INTO ${tableName} (${columns.join(', ')}) 
                    VALUES (${placeholders})
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
                `;
                await pool.query(query, values);
            } else {
                const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
                await pool.query(query, values);
            }

            importedCount++;
        } catch (error: any) {
            console.error(`   ❌ Failed to import row:`, error.message);
        }
    }

    console.log(`   ✅ Imported ${importedCount}/${rows.length} rows`);
    return importedCount;
}

/**
 * Main import function
 */
async function importAll(): Promise<void> {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    DATABASE IMPORT SCRIPT                      ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n📅 Import started at: ${new Date().toISOString()}`);
    console.log(`📁 Import from: ${EXPORT_DIR}`);

    // Check if export directory exists
    if (!fs.existsSync(EXPORT_DIR)) {
        console.error(`\n❌ Export directory not found: ${EXPORT_DIR}`);
        console.error('   Run "npx tsx scripts/export-data.ts" first to export data.');
        process.exit(1);
    }

    const stats = {
        mongo: {
            logs: 0,
            manuscripts: 0,
        },
        postgres: {
            users: 0,
            sessions: 0,
            access_requests: 0,
            manuscript_access: 0,
            verification_documents: 0,
            bookmarks: 0,
            app_settings: 0,
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // MONGODB IMPORTS
    // ═══════════════════════════════════════════════════════════════

    console.log('\n\n🍃 MONGODB IMPORTS');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`   Using URI (Logs): ${MONGODB_URI_LOG}`);
    console.log(`   Using URI (Manuscripts): ${MONGODB_URI_MANUSCRIPTS}`);

    // Import Logs
    try {
        stats.mongo.logs = await importMongoCollection(
            MONGODB_URI_LOG,
            'IKS_logs',
            'mongo_logs.json'
        );
    } catch (error) {
        console.error(`   ❌ Failed to import logs:`, error);
    }

    // Import Manuscripts
    try {
        stats.mongo.manuscripts = await importMongoCollection(
            MONGODB_URI_MANUSCRIPTS,
            'manuscripts',
            'mongo_manuscripts.json'
        );
    } catch (error) {
        console.error(`   ❌ Failed to import manuscripts:`, error);
    }

    // ═══════════════════════════════════════════════════════════════
    // POSTGRESQL IMPORTS
    // ═══════════════════════════════════════════════════════════════

    console.log('\n\n🐘 POSTGRESQL IMPORTS');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`   Using URI: ${POSTGRESS_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password

    const pool = new Pool({
        connectionString: POSTGRESS_URI,
    });

    try {
        // Test connection
        const client = await pool.connect();
        console.log('   ✅ Connected to PostgreSQL');
        client.release();

        // Create tables first
        await createPostgresTables(pool);

        // Import tables in order (respecting foreign key dependencies)
        // Users first (no dependencies)
        stats.postgres.users = await importPostgresTable(pool, 'users', 'postgres_users.json');

        // Then tables that depend on users
        stats.postgres.sessions = await importPostgresTable(pool, 'sessions', 'postgres_sessions.json');
        stats.postgres.access_requests = await importPostgresTable(pool, 'access_requests', 'postgres_access_requests.json');
        stats.postgres.manuscript_access = await importPostgresTable(pool, 'manuscript_access', 'postgres_manuscript_access.json');
        stats.postgres.verification_documents = await importPostgresTable(pool, 'verification_documents', 'postgres_verification_documents.json');
        stats.postgres.bookmarks = await importPostgresTable(pool, 'bookmarks', 'postgres_bookmarks.json');
        stats.postgres.app_settings = await importPostgresTable(pool, 'app_settings', 'postgres_app_settings.json');

    } catch (error) {
        console.error('   ❌ PostgreSQL operation failed:', error);
    } finally {
        await pool.end();
    }

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════

    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('                        IMPORT SUMMARY                           ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n🍃 MongoDB:');
    console.log(`   • Audit Logs: ${stats.mongo.logs} documents`);
    console.log(`   • Manuscripts: ${stats.mongo.manuscripts} documents`);
    console.log('\n🐘 PostgreSQL:');
    console.log(`   • Users: ${stats.postgres.users} rows`);
    console.log(`   • Sessions: ${stats.postgres.sessions} rows`);
    console.log(`   • Access Requests: ${stats.postgres.access_requests} rows`);
    console.log(`   • Manuscript Access: ${stats.postgres.manuscript_access} rows`);
    console.log(`   • Verification Documents: ${stats.postgres.verification_documents} rows`);
    console.log(`   • Bookmarks: ${stats.postgres.bookmarks} rows`);
    console.log(`   • App Settings: ${stats.postgres.app_settings} rows`);

    console.log('\n📅 Import completed at:', new Date().toISOString());
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ Migration complete! You can now start your server:');
    console.log('   npm run dev');
    console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run import
importAll()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Import failed:', error);
        process.exit(1);
    });
