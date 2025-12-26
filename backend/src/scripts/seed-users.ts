/**
 * Database Seed Script
 * Adds test users: admin, iks_member, and user
 * 
 * Run with: npm run seed
 */

import dotenv from 'dotenv';
import pg from 'pg';
import argon2 from 'argon2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to CA certificate
const CA_CERT_PATH = path.join(__dirname, '..', '..', 'certs', 'ca.pem');

// Test user configurations
const TEST_USERS = [
    {
        email: 'admin@iks.org',
        password: 'Admin@123456!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        institution: 'IKS Research Centre',
        designation: 'System Administrator',
        isEmailVerified: true,
        verificationStatus: 'VERIFIED',
    },
    {
        email: 'member@iks.org',
        password: 'Member@123456!',
        firstName: 'IKS',
        lastName: 'Member',
        role: 'REVIEWER',
        institution: 'IKS Research Centre',
        designation: 'Research Scholar',
        isEmailVerified: true,
        verificationStatus: 'VERIFIED',
    },
    {
        email: 'user@iks.org',
        password: 'User@123456!',
        firstName: 'Regular',
        lastName: 'User',
        role: 'VISITOR',
        institution: 'University',
        designation: 'Researcher',
        isEmailVerified: true,
        verificationStatus: 'PENDING',
    },
];

async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });
}

async function seedUsers(): Promise<void> {
    const connectionString = process.env.POSTGRESS_URI;

    if (!connectionString) {
        console.error('✗ POSTGRESS_URI environment variable is not set');
        console.log('Please ensure your .env file contains POSTGRESS_URI');
        process.exit(1);
    }

    console.log('📦 Starting database seed...');

    // Mask password in connection string for display
    const maskedUri = connectionString.replace(/:[^:@\/]+@/, ':****@');
    console.log('🔗 Connection:', maskedUri);

    // Load CA certificate if available
    let sslConfig: pg.PoolConfig['ssl'] = { rejectUnauthorized: false };

    if (fs.existsSync(CA_CERT_PATH)) {
        console.log('📜 Loading CA certificate from:', CA_CERT_PATH);
        sslConfig = {
            rejectUnauthorized: true,
            ca: fs.readFileSync(CA_CERT_PATH).toString(),
        };
    } else {
        console.log('⚠️  CA certificate not found, using insecure SSL connection');
    }

    const pool = new Pool({
        connectionString,
        ssl: sslConfig,
    });

    let client: pg.PoolClient | null = null;

    try {
        console.log('🔌 Connecting to PostgreSQL...');
        client = await pool.connect();
        console.log('✓ Connected to PostgreSQL\n');

        for (const user of TEST_USERS) {
            try {
                // Check if user already exists
                const existingResult = await client.query(
                    'SELECT id FROM users WHERE email = $1',
                    [user.email]
                );

                if (existingResult.rows.length > 0) {
                    console.log(`⏭️  User ${user.email} already exists, skipping...`);
                    continue;
                }

                // Hash password
                console.log(`🔐 Hashing password for ${user.email}...`);
                const passwordHash = await hashPassword(user.password);

                // Insert user
                await client.query(
                    `INSERT INTO users (
                        email, password_hash, first_name, last_name, role,
                        institution, designation, is_email_verified, verification_status,
                        is_active, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
                    [
                        user.email,
                        passwordHash,
                        user.firstName,
                        user.lastName,
                        user.role,
                        user.institution,
                        user.designation,
                        user.isEmailVerified,
                        user.verificationStatus,
                        true,
                    ]
                );

                console.log(`✓ Created user: ${user.email} (Role: ${user.role})`);
            } catch (userError: unknown) {
                const errorMessage = userError instanceof Error ? userError.message : String(userError);
                console.error(`✗ Error creating user ${user.email}:`, errorMessage);
            }
        }

        console.log('\n═══════════════════════════════════════════');
        console.log('🎉 Seed completed successfully!');
        console.log('═══════════════════════════════════════════\n');
        console.log('📋 Test Accounts:');
        console.log('┌─────────────────────────────────────────────────────┐');
        console.log('│ Role       │ Email              │ Password          │');
        console.log('├────────────┼────────────────────┼───────────────────┤');
        console.log('│ ADMIN      │ admin@iks.org      │ Admin@123456!     │');
        console.log('│ REVIEWER   │ member@iks.org     │ Member@123456!    │');
        console.log('│ VISITOR    │ user@iks.org       │ User@123456!      │');
        console.log('└─────────────────────────────────────────────────────┘');
        console.log('\n');

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('✗ Error seeding users:', errorMessage);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
        console.log('🔌 Database connection closed');
    }
}

// Run the seed
seedUsers()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Fatal error:', errorMessage);
        process.exit(1);
    });
