import mongoose from 'mongoose';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './index.js';

const { Pool } = pg;

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to CA certificate
const CA_CERT_PATH = path.join(__dirname, '..', '..', 'certs', 'ca.pem');

// Singleton connection objects - exported as getter functions
let _mongoLogsConnection: mongoose.Connection | null = null;
let _mongoManuscriptsConnection: mongoose.Connection | null = null;
let _pgPool: pg.Pool | null = null;

// Getters for connections
export function getMongoLogsConnection(): mongoose.Connection {
    if (!_mongoLogsConnection) {
        throw new Error('MongoDB Logs connection not established. Call connectAllDatabases() first.');
    }
    return _mongoLogsConnection;
}

export function getMongoManuscriptsConnection(): mongoose.Connection {
    if (!_mongoManuscriptsConnection) {
        throw new Error('MongoDB Manuscripts connection not established. Call connectAllDatabases() first.');
    }
    return _mongoManuscriptsConnection;
}

export function getPgPool(): pg.Pool {
    if (!_pgPool) {
        throw new Error('PostgreSQL connection not established. Call connectAllDatabases() first.');
    }
    return _pgPool;
}

/**
 * Connect to MongoDB Logs database (iks_log)
 */
export async function connectMongoLogs(): Promise<void> {
    try {
        console.log('🔗 Starting MongoDB Logs Connection...');
        _mongoLogsConnection = mongoose.createConnection(config.mongoUriLogs);

        _mongoLogsConnection.on('connected', () => {
            console.log('🍃 MongoDB connected to Logs DB');
        });

        _mongoLogsConnection.on('error', (error) => {
            console.error('✗ MongoDB (Logs) connection error:', error);
        });

        // Wait for connection
        await new Promise<void>((resolve, reject) => {
            _mongoLogsConnection!.once('open', resolve);
            _mongoLogsConnection!.once('error', reject);
        });
    } catch (error) {
        console.error('✗ MongoDB (Logs) connection failed:', error);
        throw error;
    }
}

/**
 * Connect to MongoDB Manuscripts database
 */
export async function connectMongoManuscripts(): Promise<void> {
    try {
        console.log('🔗 Starting MongoDB Manuscripts Connection...');
        _mongoManuscriptsConnection = mongoose.createConnection(config.mongoUriManuscripts);

        _mongoManuscriptsConnection.on('connected', () => {
            console.log('🍃 MongoDB connected to Manuscripts DB');
        });

        _mongoManuscriptsConnection.on('error', (error) => {
            console.error('✗ MongoDB (Manuscripts) connection error:', error);
        });

        // Wait for connection
        await new Promise<void>((resolve, reject) => {
            _mongoManuscriptsConnection!.once('open', resolve);
            _mongoManuscriptsConnection!.once('error', reject);
        });
    } catch (error) {
        console.error('✗ MongoDB (Manuscripts) connection failed:', error);
        throw error;
    }
}

/**
 * Connect to PostgreSQL database
 */
export async function connectPostgres(): Promise<void> {
    try {
        console.log('🔗 Starting PostgreSQL Connection...');
        // Load CA certificate if available
        let sslConfig: pg.PoolConfig['ssl'] = { rejectUnauthorized: false };

        if (fs.existsSync(CA_CERT_PATH)) {
            // console.log('📜 Loading CA certificate from:', CA_CERT_PATH);
            sslConfig = {
                rejectUnauthorized: true,
                ca: fs.readFileSync(CA_CERT_PATH).toString(),
            };
        }

        _pgPool = new Pool({
            connectionString: config.postgresUri,
            ssl: sslConfig,
        });

        // Test connection
        const client = await _pgPool.connect();
        console.log('🐘 PostgreSQL connected');
        client.release();

        // Initialize tables
        await initializePostgresTables();
    } catch (error) {
        console.error('✗ PostgreSQL connection failed:', error);
        throw error;
    }
}

/**
 * Initialize PostgreSQL tables
 */
async function initializePostgresTables(): Promise<void> {
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

    await _pgPool!.query(createTablesQuery);
    console.log('✓ PostgreSQL tables initialized');
}

/**
 * Connect to all databases
 */
export async function connectAllDatabases(): Promise<void> {
    await Promise.all([
        connectMongoLogs(),
        connectMongoManuscripts(),
        connectPostgres(),
    ]);
}

/**
 * Disconnect from all databases
 */
export async function disconnectAllDatabases(): Promise<void> {
    try {
        if (_mongoLogsConnection) {
            await _mongoLogsConnection.close();
            console.log('✓ MongoDB (Logs) disconnected');
        }
        if (_mongoManuscriptsConnection) {
            await _mongoManuscriptsConnection.close();
            console.log('✓ MongoDB (Manuscripts) disconnected');
        }
        if (_pgPool) {
            await _pgPool.end();
            console.log('✓ PostgreSQL disconnected');
        }
    } catch (error) {
        console.error('Error disconnecting from databases:', error);
    }
}
