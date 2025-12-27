import { Router } from 'express';
import * as bookmarkController from '../controllers/bookmark.controller.js';
import { authenticate } from '../middleware/index.js';

const router = Router();

// All bookmark routes require authentication
router.use(authenticate);

// Get all bookmarks for current user
router.get('/', bookmarkController.getBookmarks);

// Check if a manuscript is bookmarked
router.get('/check/:manuscriptId', bookmarkController.checkBookmark);

// Toggle bookmark (add/remove)
router.post('/toggle', bookmarkController.toggleBookmark);

// Add a bookmark
router.post('/', bookmarkController.addBookmark);

// Remove a bookmark
router.delete('/:manuscriptId', bookmarkController.removeBookmark);

export default router;
