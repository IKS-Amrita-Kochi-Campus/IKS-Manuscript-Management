import { Schema, Model } from 'mongoose';
import { getMongoLogsConnection } from '../../config/database.js';

export interface IAuditLog {
    _id?: string;
    sessionId?: string;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    action: string;
    actionCategory: string;
    status: 'success' | 'failure' | 'pending';
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    method: string;
    path: string;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
    statusCode?: number;
    responseTime?: number;
    ipAddress: string;
    userAgent?: string;
    geo?: {
        country?: string;
        city?: string;
        region?: string;
    };
    metadata?: Record<string, unknown>;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        sessionId: { type: String, index: true },
        userId: { type: String, index: true },
        userEmail: { type: String },
        userRole: { type: String },
        action: { type: String, required: true, index: true },
        actionCategory: {
            type: String,
            required: true,
            enum: [
                'authentication',
                'user_management',
                'manuscript_management',
                'access_control',
                'file_operations',
                'admin_operations',
                'system',
            ],
            index: true,
        },
        status: {
            type: String,
            enum: ['success', 'failure', 'pending'],
            default: 'success',
            index: true,
        },
        resourceType: { type: String },
        resourceId: { type: String },
        resourceName: { type: String },
        method: { type: String, required: true },
        path: { type: String, required: true },
        query: { type: Schema.Types.Mixed },
        body: { type: Schema.Types.Mixed },
        statusCode: { type: Number },
        responseTime: { type: Number },
        ipAddress: { type: String, required: true },
        userAgent: { type: String },
        geo: {
            country: { type: String },
            city: { type: String },
            region: { type: String },
        },
        metadata: { type: Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    {
        collection: 'IKS_logs',
    }
);

// Compound indexes for common queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });

// TTL index to automatically delete old logs (90 days)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Cache the model instance
let cachedModel: Model<IAuditLog> | null = null;

export function getAuditLogModel(): Model<IAuditLog> {
    if (!cachedModel) {
        const connection = getMongoLogsConnection();
        cachedModel = connection.model<IAuditLog>('AuditLog', AuditLogSchema);
    }
    return cachedModel;
}
