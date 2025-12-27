import { Router } from 'express';
import * as accessController from '../controllers/access.controller.js';
import { authenticate, requireUser, requireOwner } from '../middleware/index.js';
import { validateBody } from '../middleware/index.js';
import { accessRequestSchema } from '../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create access request
router.post('/', requireUser, validateBody(accessRequestSchema), accessController.createRequest);

// Get my requests
router.get('/my', accessController.getMyRequests);

// Check if user has pending request for a manuscript
router.get('/check/:manuscriptId', accessController.checkRequest);

// Get requests for a manuscript (owner/reviewer only)
router.get('/manuscript/:manuscriptId', accessController.getManuscriptRequests);

// Review requests
router.put('/:id/approve', accessController.approveRequest);
router.put('/:id/reject', accessController.rejectRequest);

// Revoke access
router.delete('/revoke/:manuscriptId/:userId', accessController.revokeAccess);

export default router;
