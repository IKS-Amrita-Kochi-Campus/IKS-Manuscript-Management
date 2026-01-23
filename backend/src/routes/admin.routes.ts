import { Router, Request, Response } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, requireAdmin, requireReviewer } from '../middleware/index.js';
import { validateBody } from '../middleware/index.js';
import { updateRoleSchema, verifyIdentitySchema } from '../utils/validators.js';
import pullLatestCommit from '../../scripts/git-recovery.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Statistics and pending approvals (admin + reviewer)
router.get('/statistics', requireAdmin, adminController.getStatistics);
router.get('/pending-approvals', requireReviewer, adminController.getPendingApprovals);
router.get('/access-requests', requireReviewer, adminController.getAccessRequests);

// User management (admin only)
router.get('/users', requireAdmin, adminController.getUsers);
router.get('/users/:id', requireAdmin, adminController.getUserById);
router.put('/users/:id/role', requireAdmin, validateBody(updateRoleSchema), adminController.updateUserRole);
router.put('/users/:id/status', requireAdmin, adminController.updateUserStatus);

// Identity verification (admin only)
router.get('/verification-requests', requireAdmin, adminController.getVerificationRequests);
router.put('/verification/:userId', requireAdmin, validateBody(verifyIdentitySchema), adminController.verifyIdentity);

// Manuscript management (admin + reviewer)
router.get('/manuscripts', requireReviewer, adminController.getAllManuscripts);
router.put('/manuscripts/:id/status', requireReviewer, adminController.updateManuscriptStatus);

// Audit logs (admin only)
router.get('/audit-logs', requireAdmin, adminController.getAuditLogs);

// System recovery (admin only)
router.post('/recover', requireAdmin, async (req: Request, res: Response) => {
    try {
        const result = await pullLatestCommit();

        res.json({
            success: result.success,
            message: result.message,
            commit: result.commit,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Recovery failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
