import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import manuscriptRoutes from './manuscript.routes.js';
import accessRoutes from './access.routes.js';
import adminRoutes from './admin.routes.js';
import bookmarkRoutes from './bookmark.routes.js';
import settingsRoutes from './settings.routes.js';
import logRoutes from './log.routes.js';

import notificationRoutes from './notification.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/manuscripts', manuscriptRoutes);
router.use('/access-requests', accessRoutes);
router.use('/admin', adminRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/settings', settingsRoutes);
router.use('/logs', logRoutes);
router.use('/notifications', notificationRoutes);

export default router;

