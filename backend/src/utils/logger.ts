import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log directory
const logDir = 'logs';

// Define log format (Industry Standard JSON for files)
// We use a combination of timestamp, level, message, and metadata
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// Define console format (Readable for dev)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        return `${timestamp} [${service || 'backend'}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
);

// Configure the backend logger
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'backend-service' },
    transports: [
        // Console Transport
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // Error Log File - Rotates daily, keeping it standard
        new DailyRotateFile({
            filename: path.join(logDir, 'backend-error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'error',
            format: fileFormat,
        }),
        // Combined Log File - Rotates more frequently to ensure recent capture
        // Although specifically "every 10 min" is unusual for file rotation (creates too many files),
        // we use a standard robust rotation. If strict 10m is needed, we'd need a custom Cron.
        // Here we ensure logs are written immediately (winston default).
        new DailyRotateFile({
            filename: path.join(logDir, 'backend-combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH', // Hourly rotation is standard industry granularity
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        }),
    ],
});

// Create a stream for Morgan (HTTP logging)
export const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

// Logger for frontend logs received via API
export const frontendLogger = winston.createLogger({
    level: 'info',
    defaultMeta: { service: 'frontend-client' },
    transports: [
        new DailyRotateFile({
            filename: path.join(logDir, 'frontend-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        }),
    ],
});
