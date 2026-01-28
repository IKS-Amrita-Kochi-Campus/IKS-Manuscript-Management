import { getApiUrl } from './api';

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    [key: string]: any;
}

class Logger {
    private buffer: LogEntry[] = [];
    private flushInterval: number = 10 * 60 * 1000; // 10 minutes
    private maxBufferSize: number = 100; // Auto-flush if buffer is full
    private intervalId: NodeJS.Timeout | null = null;

    constructor() {
        this.startFlushInterval();

        // Ensure logs are flushed when the window unloads
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.flush();
            });
        }
    }

    private startFlushInterval() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    private async flush() {
        if (this.buffer.length === 0) return;

        const logsToSend = [...this.buffer];
        this.buffer = []; // Clear buffer immediately

        try {
            // Using fetch directly to avoid circular dependency if api.ts uses logger
            // But api.ts seems to use console. we can use getApiUrl.
            // Note: If auth token is needed we should get it.
            // For now, let's assume the endpoint is open or we attach token if present.
            const accessToken = localStorage.getItem('accessToken');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            await fetch(getApiUrl('/logs'), {
                method: 'POST',
                headers,
                body: JSON.stringify({ logs: logsToSend }),
                keepalive: true // Important for unload events
            });
        } catch (error) {
            // If flush fails, put logs back (optional, might cause overflow loop)
            // console.error('Failed to flush logs', error);
            // We print to console as fallback
        }
    }

    private log(level: LogLevel, message: string, meta: any = {}) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
            ...meta
        };

        // Always print to console in dev or if critical
        const style = level === 'error' ? 'color: red' : level === 'warn' ? 'color: orange' : 'color: blue';
        console.log(`%c[${level.toUpperCase()}] ${message}`, style, meta);

        this.buffer.push(entry);

        if (this.buffer.length >= this.maxBufferSize) {
            this.flush();
        }
    }

    public info(message: string, meta?: any) {
        this.log('info', message, meta);
    }

    public warn(message: string, meta?: any) {
        this.log('warn', message, meta);
    }

    public error(message: string, meta?: any) {
        this.log('error', message, meta);
    }
}

export const logger = new Logger();
