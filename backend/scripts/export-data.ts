/**
 * Database Export Script
 * 
 * This script exports all data from MongoDB and PostgreSQL databases to JSON files.
 * Run this script when connected to your REMOTE databases to export data before migration.
 * 
 * Usage:
 *   1. Ensure your .env file has the REMOTE database credentials
 *   2. Run: npx tsx scripts/export-data.ts
 *   3. JSON files will be created in ./scripts/exports/
 * 
 * Note: Make sure to run this BEFORE changing your .env to local database credentials!
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

// Environment variables (from your .env)
const MONGODB_URI_LOG = process.env.MONGODB_URI_LOG;
const MONGODB_URI_MANUSCRIPTS = process.env.MONGODB_URI_MANUSCRIPTS;
const POSTGRESS_URI = process.env.POSTGRESS_URI;

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
    console.log(`📁 Created export directory: ${EXPORT_DIR}`);
}

/**
 * Export MongoDB collection to JSON
 */
async function exportMongoCollection(
    uri: string,
    dbName: string,
    collectionName: string,
    outputFileName: string
): Promise<number> {
    console.log(`\n📤 Exporting MongoDB: ${dbName}.${collectionName}...`);

    const connection = await mongoose.createConnection(uri).asPromise();

    try {
        const collection = connection.db!.collection(collectionName);
        const documents = await collection.find({}).toArray();

        const outputPath = path.join(EXPORT_DIR, outputFileName);
        fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2), 'utf-8');

        console.log(`   ✅ Exported ${documents.length} documents to ${outputFileName}`);
        return documents.length;
    } finally {
        await connection.close();
    }
}

/**
 * Export PostgreSQL table to JSON
 */
async function exportPostgresTable(
    pool: pg.Pool,
    tableName: string,
    outputFileName: string
): Promise<number> {
    console.log(`\n📤 Exporting PostgreSQL: ${tableName}...`);

    try {
        const result = await pool.query(`SELECT * FROM ${tableName}`);
        const outputPath = path.join(EXPORT_DIR, outputFileName);
        fs.writeFileSync(outputPath, JSON.stringify(result.rows, null, 2), 'utf-8');

        console.log(`   ✅ Exported ${result.rows.length} rows to ${outputFileName}`);
        return result.rows.length;
    } catch (error: any) {
        if (error.code === '42P01') {
            // Table doesn't exist
            console.log(`   ⚠️  Table ${tableName} does not exist (skipping)`);
            return 0;
        }
        throw error;
    }
}

/**
 * Main export function
 */
async function exportAll(): Promise<void> {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    DATABASE EXPORT SCRIPT                      ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n📅 Export started at: ${new Date().toISOString()}`);
    console.log(`📁 Export directory: ${EXPORT_DIR}`);

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
    // MONGODB EXPORTS
    // ═══════════════════════════════════════════════════════════════

    console.log('\n\n🍃 MONGODB EXPORTS');
    console.log('─────────────────────────────────────────────────────────────────');

    // Export Logs Database
    if (MONGODB_URI_LOG) {
        try {
            stats.mongo.logs = await exportMongoCollection(
                MONGODB_URI_LOG,
                'iks_log',
                'IKS_logs',
                'mongo_logs.json'
            );
        } catch (error) {
            console.error(`   ❌ Failed to export logs:`, error);
        }
    } else {
        console.log('   ⚠️  MONGODB_URI_LOG not set (skipping logs export)');
    }

    // Export Manuscripts Database
    if (MONGODB_URI_MANUSCRIPTS) {
        try {
            stats.mongo.manuscripts = await exportMongoCollection(
                MONGODB_URI_MANUSCRIPTS,
                'manuscript',
                'manuscripts',
                'mongo_manuscripts.json'
            );
        } catch (error) {
            console.error(`   ❌ Failed to export manuscripts:`, error);
        }
    } else {
        console.log('   ⚠️  MONGODB_URI_MANUSCRIPTS not set (skipping manuscripts export)');
    }

    // ═══════════════════════════════════════════════════════════════
    // POSTGRESQL EXPORTS
    // ═══════════════════════════════════════════════════════════════

    console.log('\n\n🐘 POSTGRESQL EXPORTS');
    console.log('─────────────────────────────────────────────────────────────────');

    if (POSTGRESS_URI) {
        // Disable SSL certificate validation for export (if needed)
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const pool = new Pool({
            connectionString: POSTGRESS_URI,
            ssl: { rejectUnauthorized: false },
        });

        try {
            // Test connection
            const client = await pool.connect();
            console.log('   ✅ Connected to PostgreSQL');
            client.release();

            // PostgreSQL tables to export (in order to respect foreign key dependencies)
            const tables = [
                'users',
                'sessions',
                'access_requests',
                'manuscript_access',
                'verification_documents',
                'bookmarks',
                'app_settings',
            ];

            for (const table of tables) {
                try {
                    const count = await exportPostgresTable(pool, table, `postgres_${table}.json`);
                    stats.postgres[table as keyof typeof stats.postgres] = count;
                } catch (error) {
                    console.error(`   ❌ Failed to export ${table}:`, error);
                }
            }
        } catch (error) {
            console.error('   ❌ PostgreSQL connection failed:', error);
        } finally {
            await pool.end();
        }
    } else {
        console.log('   ⚠️  POSTGRESS_URI not set (skipping PostgreSQL export)');
    }

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════

    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('                        EXPORT SUMMARY                           ');
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

    console.log('\n📁 Export files saved to:', EXPORT_DIR);
    console.log('📅 Export completed at:', new Date().toISOString());
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('Next steps:');
    console.log('  1. Update your .env with local database credentials');
    console.log('  2. Start local MongoDB and PostgreSQL services');
    console.log('  3. Run: npx tsx scripts/import-data.ts');
    console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run export
exportAll()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Export failed:', error);
        process.exit(1);
    });
