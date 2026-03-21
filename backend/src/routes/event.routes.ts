import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/index.js';
import { eventImageUpload } from '../middleware/upload.middleware.js';
import * as eventController from '../controllers/event.controller.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/events        – list all events (latest date first)
router.get('/', eventController.getEvents);

// GET /api/events/:id    – single event detail
router.get('/:id', eventController.getEventById);

// ─── Admin-only Routes ────────────────────────────────────────────────────────
// POST /api/events/add   – create event with image uploads (multipart/form-data)
router.post(
    '/add',
    authenticate,
    requireAdmin,
    eventImageUpload.array('images', 10),
    eventController.addEvent
);

// PUT /api/events/:id    – update an existing event (multipart/form-data)
router.put(
    '/:id',
    authenticate,
    requireAdmin,
    eventImageUpload.array('images', 10),
    eventController.updateEvent
);

// DELETE /api/events/:id – delete event + its image files
router.delete('/:id', authenticate, requireAdmin, eventController.deleteEvent);

export default router;
