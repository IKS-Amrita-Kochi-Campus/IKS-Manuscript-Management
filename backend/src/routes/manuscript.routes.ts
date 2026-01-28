import { Router } from 'express';
import * as manuscriptController from '../controllers/manuscript.controller.js';
import { authenticate, optionalAuth, requireOwner } from '../middleware/index.js';
import { validateBody, validateQuery } from '../middleware/index.js';
import { manuscriptUpload, uploadLimiter, downloadLimiter } from '../middleware/index.js';
import { manuscriptSchema, searchSchema } from '../utils/validators.js';

const router = Router();


// User's manuscripts (Must be before /:id)
router.get('/my/manuscripts', authenticate, manuscriptController.getMyManuscripts);

// Public routes (with optional auth for personalized results)
router.get('/search', optionalAuth, validateQuery(searchSchema), manuscriptController.search);
router.get('/stats', manuscriptController.getPublicStats);
router.get('/filters', manuscriptController.getFilters);
router.get('/:id', optionalAuth, manuscriptController.getById);
router.get('/:id/citation', optionalAuth, manuscriptController.exportCitation); // New route

// Protected routes
router.post('/', authenticate, validateBody(manuscriptSchema), manuscriptController.create);
router.put('/:id', authenticate, manuscriptController.update);
router.post('/:id/doi', authenticate, manuscriptController.assignDoi); // New route
router.delete('/:id', authenticate, manuscriptController.remove);
router.delete('/:id/permanent', authenticate, manuscriptController.permanentDelete);
router.post('/:id/hide', authenticate, manuscriptController.hide);
router.post('/:id/unhide', authenticate, manuscriptController.unhide);

// File management
router.post('/:id/files', authenticate, uploadLimiter, manuscriptUpload.array('files', 10), manuscriptController.uploadFiles);
router.delete('/:id/files/:fileIndex', authenticate, manuscriptController.deleteFile);

// Secure viewing and download
router.get('/:id/view/:fileIndex', authenticate, manuscriptController.viewFile);
router.get('/:id/download/:fileIndex', authenticate, downloadLimiter, manuscriptController.downloadFile);

export default router;
