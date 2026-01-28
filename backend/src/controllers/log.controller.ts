import { Request, Response } from 'express';
import { frontendLogger } from '../utils/logger.js';

export async function logFrontend(req: Request, res: Response): Promise<void> {
    const { logs } = req.body;

    if (!Array.isArray(logs)) {
        res.status(400).json({ success: false, error: 'Invalid log format' });
        return;
    }

    logs.forEach((log: any) => {
        const { level, message, timestamp, ...meta } = log;
        frontendLogger.log({
            level: level || 'info',
            message: message || 'No message',
            timestamp: timestamp || new Date().toISOString(),
            ...meta
        });
    });

    res.json({ success: true });
}
