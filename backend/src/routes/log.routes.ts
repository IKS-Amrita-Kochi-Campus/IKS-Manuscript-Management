import { Router } from 'express';
import * as logController from '../controllers/log.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint to receive logs from frontend
// We might want to allow unauthenticated logs for login errors, 
// but for safery let's start with flexible or authenticated.
// Actually, frontend logger might run before auth (login page).
// So this route should be public but rate-limited.
router.post('/', logController.logFrontend);

export default router;
