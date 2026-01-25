import { Router } from 'express';
import * as manuscriptController from '../controllers/manuscript.controller.js';
import { authenticate, optionalAuth, requireOwner } from '../middleware/index.js';
import { validateBody, validateQuery } from '../middleware/index.js';
import { manuscriptUpload, uploadLimiter, downloadLimiter } from '../middleware/index.js';
import { manuscriptSchema, searchSchema } from '../utils/validators.js';

const router = Router();

// Public routes (with optional auth for personalized results)
router.get('/search', optionalAuth, validateQuery(searchSchema), manuscriptController.search);
router.get('/stats', manuscriptController.getPublicStats);
router.get('/filters', manuscriptController.getFilters);
router.get('/:id', optionalAuth, manuscriptController.getById);

// Protected routes
router.post('/', authenticate, validateBody(manuscriptSchema), manuscriptController.create);
router.put('/:id', authenticate, manuscriptController.update);
router.delete('/:id', authenticate, manuscriptController.remove);

// File management
router.post('/:id/files', authenticate, uploadLimiter, manuscriptUpload.array('files', 10), manuscriptController.uploadFiles);
router.delete('/:id/files/:fileIndex', authenticate, manuscriptController.deleteFile);

// Secure viewing and download
router.get('/:id/view/:fileIndex', authenticate, manuscriptController.viewFile);
router.get('/:id/download/:fileIndex', authenticate, downloadLimiter, manuscriptController.downloadFile);

// User's manuscripts
router.get('/my/manuscripts', authenticate, manuscriptController.getMyManuscripts);

export default router;
