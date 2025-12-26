import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import manuscriptRoutes from './manuscript.routes.js';
import accessRoutes from './access.routes.js';
import adminRoutes from './admin.routes.js';

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

export default router;
