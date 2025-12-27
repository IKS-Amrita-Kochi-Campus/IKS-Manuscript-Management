import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Environment
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    apiPrefix: process.env.API_PREFIX || '/api',

    // MongoDB - Logs Database
    mongoUriLogs: process.env.MONGODB_URI_LOG || 'mongodb://localhost:27017/iks_log',

    // MongoDB - Manuscripts Database  
    mongoUriManuscripts: process.env.MONGODB_URI_MANUSCRIPTS || 'mongodb://localhost:27017/manuscript',

    // PostgreSQL - User Data
    postgresUri: process.env.POSTGRESS_URI || 'postgres://localhost:5432/iks',

    // JWT Configuration
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    },

    // Redis (optional - for caching)
    redisUrl: process.env.REDIS_URL || '',

    // Local File Storage
    storage: {
        localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    },

    // Encryption
    encryption: {
        key: process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-characters!',
    },

    // Email (SMTP)
    email: {
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
        from: process.env.SMTP_FROM || 'noreply@manuscripts.edu',
    },

    // Frontend URL (for CORS and email links)
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },

    // Password Policy
    password: {
        minLength: 8,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSymbols: false,
    },

    // Session
    session: {
        maxConcurrent: 5,
        absoluteTimeout: 24 * 60 * 60 * 1000, // 24 hours
        idleTimeout: 30 * 60 * 1000, // 30 minutes
    },

    // Account Lockout
    lockout: {
        maxAttempts: 5,
        duration: 30 * 60 * 1000, // 30 minutes
    },
};
