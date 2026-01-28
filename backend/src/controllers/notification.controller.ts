import { Request, Response } from 'express';
import { getNotificationModel } from '../models/mongo/Notification.model.js';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const Notification = getNotificationModel();
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const Notification = getNotificationModel();
        await Notification.updateOne(
            { _id: id, userId },
            { $set: { isRead: true } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const Notification = getNotificationModel();
        await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Helper to create notification (not an endpoint, but for internal use)
export const createNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', link?: string) => {
    try {
        const Notification = getNotificationModel();
        await Notification.create({
            userId,
            title,
            message,
            type,
            link
        });
    } catch (error) {
        console.error('Create notification error:', error);
    }
};
