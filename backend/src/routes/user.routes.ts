import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/index.js';
import { validateBody } from '../middleware/index.js';
import { identityUpload } from '../middleware/index.js';
import { updateProfileSchema } from '../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', userController.getProfile);
router.put('/me', validateBody(updateProfileSchema), userController.updateProfile);
router.put('/me/password', userController.changePassword);
router.post('/me/identity', identityUpload.single('document'), userController.uploadIdentityDocument);
router.get('/me/identity/status', userController.getVerificationStatus);
router.get('/me/sessions', userController.getSessions);
router.delete('/me/sessions/:id', userController.revokeSession);

export default router;
