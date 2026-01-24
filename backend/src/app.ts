import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/index.js';
import { connectAllDatabases, disconnectAllDatabases } from './config/database.js';
import { auditLog, apiLimiter } from './middleware/index.js';
import routes from './routes/index.js';
import ensureLatestCode from './utils/startup-recovery.js';

// Allow self-signed certificates for cloud databases (Aiven, Atlas)
// In production, use proper SSL certificates
if (config.env !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();

// Trust proxy - required for correct client IP extraction
// Set to 1 for single reverse proxy, adjust number based on your setup
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration - allow multiple origins in development
const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (config.env === 'development' || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.env !== 'test') {
    app.use(morgan('combined'));
}

// Rate limiting
app.use(config.apiPrefix, apiLimiter);
app.use(apiLimiter); // Also apply globally as fallback

// Audit logging
app.use(config.apiPrefix, auditLog);
app.use(auditLog); // Also apply globally as fallback

// API routes
app.use(config.apiPrefix, routes);
// Fallback routes without API prefix (for backward compatibility)
app.use(routes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND',
        path: req.path,
    });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);

    // Multer file size error
    if (err.message?.includes('File too large')) {
        res.status(413).json({
            success: false,
            error: 'File size exceeds the limit',
            code: 'FILE_TOO_LARGE',
        });
        return;
    }

    // Multer file type error
    if (err.message?.includes('File type')) {
        res.status(400).json({
            success: false,
            error: err.message,
            code: 'INVALID_FILE_TYPE',
        });
        return;
    }

    res.status(500).json({
        success: false,
        error: config.env === 'production'
            ? 'Internal server error'
            : err.message,
        code: 'INTERNAL_ERROR',
    });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    try {
        await disconnectAllDatabases();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Helper to get public IP
const getPublicIp = (): Promise<string> => {
    return new Promise((resolve) => {
        http.get({ 'host': 'api.ipify.org', 'port': 80, 'path': '/' }, (resp) => {
            let data = '';
            resp.on('data', (chunk) => { data += chunk; });
            resp.on('end', () => { resolve(data); });
        }).on('error', () => {
            resolve('Unavailable');
        });
    });
};

// Start server
const startServer = async () => {
    try {
        // Run startup recovery check
        await ensureLatestCode();

        // Connect to all databases (2 MongoDB + 1 PostgreSQL)
        await connectAllDatabases();

        const publicIp = await getPublicIp();
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

        // Start listening
        app.listen(config.port, () => {
            console.log(`
██╗██╗  ██╗███████╗      ██████╗  █████╗  ██████╗██╗  ██╗███████╗███╗   ██╗██████╗       ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗
██║██║ ██╔╝██╔════╝      ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝████╗  ██║██╔══██╗      ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
██║█████╔╝ ███████╗█████╗██████╔╝███████║██║     █████╔╝ █████╗  ██╔██╗ ██║██║  ██║█████╗███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
██║██╔═██╗ ╚════██║╚════╝██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██║╚██╗██║██║  ██║╚════╝╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
██║██║  ██╗███████║      ██████╔╝██║  ██║╚██████╗██║  ██╗███████╗██║ ╚████║██████╔╝      ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
╚═╝╚═╝  ╚═╝╚══════╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝       ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝

Welcome to IKS-Backend-Server

Date:         ${dateStr}
Time:         ${timeStr}
TimeStamp:    ${now.toISOString()}

HTTP server running on port ${config.port}
Your public IP address is: ${publicIp}
`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
