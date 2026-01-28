import { Schema, Model } from 'mongoose';
import { getMongoManuscriptsConnection } from '../../config/database.js';

export interface INotification {
    _id?: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: String, required: true, index: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
        link: { type: String },
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        collection: 'notifications',
    }
);

let cachedModel: Model<INotification> | null = null;

export function getNotificationModel(): Model<INotification> {
    if (!cachedModel) {
        const connection = getMongoManuscriptsConnection();
        cachedModel = connection.model<INotification>('Notification', NotificationSchema);
    }
    return cachedModel;
}
