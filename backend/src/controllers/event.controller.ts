import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { getEventModel } from '../models/mongo/Event.model.js';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to uploads/events folder (created if missing at startup)
const EVENTS_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'events');

// Ensure the events upload directory exists
if (!fs.existsSync(EVENTS_UPLOAD_DIR)) {
    fs.mkdirSync(EVENTS_UPLOAD_DIR, { recursive: true });
}

// ─── Image compression helper ─────────────────────────────────────────────────

/**
 * Compress and save a single image buffer as WebP.
 * - Resizes to max 1920 × 1080 (preserving aspect ratio, never upscaling)
 * - Quality 82% — looks great on web, ~70–80% smaller than PNG/JPEG
 * Returns the public URL path (e.g. /uploads/events/abc.webp)
 */
async function compressAndSaveImage(buffer: Buffer, originalName: string): Promise<string> {
    const filename = `${uuidv4()}.webp`;
    const destPath = path.join(EVENTS_UPLOAD_DIR, filename);

    await sharp(buffer)
        .resize(1920, 1080, {
            fit: 'inside',          // Keep aspect ratio, never crop
            withoutEnlargement: true, // Never upscale a small image
        })
        .webp({ quality: 82 })
        .toFile(destPath);

    return `/uploads/events/${filename}`;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/events/add
 * Admin only — Create a new event with optional image uploads.
 * Accepts multipart/form-data: title, description, date, images[]
 */
export const addEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, date } = req.body;

        // Validate required fields
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: 'Title is required',
                code: 'VALIDATION_ERROR',
            });
            return;
        }

        if (!date) {
            res.status(400).json({
                success: false,
                error: 'Date is required',
                code: 'VALIDATION_ERROR',
            });
            return;
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            res.status(400).json({
                success: false,
                error: 'Invalid date format',
                code: 'VALIDATION_ERROR',
            });
            return;
        }

        // Process uploaded image files (multer puts them in req.files)
        const uploadedFiles = (req.files as Express.Multer.File[]) || [];
        const imagePaths: string[] = [];

        for (const file of uploadedFiles) {
            try {
                const publicPath = await compressAndSaveImage(file.buffer, file.originalname);
                imagePaths.push(publicPath);
            } catch (imgErr) {
                console.error(`Failed to process image ${file.originalname}:`, imgErr);
                // Skip bad images, don't abort the whole request
            }
        }

        const EventModel = getEventModel();

        const event = await EventModel.create({
            title: title.trim(),
            description: description ? String(description).trim() : undefined,
            date: parsedDate,
            images: imagePaths,
        });

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: {
                _id: event._id,
                title: event.title,
                description: event.description,
                date: event.date,
                images: event.images,
                createdAt: event.createdAt,
            },
        });
    } catch (error) {
        console.error('addEvent error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create event',
            code: 'INTERNAL_ERROR',
        });
    }
};

/**
 * GET /api/events
 * Public — Return all events sorted by latest date first.
 */
export const getEvents = async (_req: Request, res: Response): Promise<void> => {
    try {
        const EventModel = getEventModel();

        const events = await EventModel.find({})
            .sort({ date: -1 })
            .select('title description date images createdAt')
            .lean();

        res.json({
            success: true,
            count: events.length,
            events,
        });
    } catch (error) {
        console.error('getEvents error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events',
            code: 'INTERNAL_ERROR',
        });
    }
};

/**
 * GET /api/events/:id
 * Public — Return a single event by ID.
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const EventModel = getEventModel();

        const event = await EventModel.findById(id).lean();

        if (!event) {
            res.status(404).json({
                success: false,
                error: 'Event not found',
                code: 'NOT_FOUND',
            });
            return;
        }

        res.json({ success: true, event });
    } catch (error) {
        console.error('getEventById error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event',
            code: 'INTERNAL_ERROR',
        });
    }
};

/**
 * DELETE /api/events/:id
 * Admin only — Delete an event and its image files from disk.
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const EventModel = getEventModel();

        const event = await EventModel.findByIdAndDelete(id);

        if (!event) {
            res.status(404).json({
                success: false,
                error: 'Event not found',
                code: 'NOT_FOUND',
            });
            return;
        }

        // Clean up image files from disk
        for (const imgPath of event.images) {
            const fullPath = path.join(__dirname, '..', '..', imgPath);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (e) {
                    console.warn(`Could not delete image file: ${fullPath}`, e);
                }
            }
        }

        res.json({
            success: true,
            message: 'Event deleted successfully',
        });
    } catch (error) {
        console.error('deleteEvent error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete event',
            code: 'INTERNAL_ERROR',
        });
    }
};

/**
 * PUT /api/events/:id
 * Admin only — Update an existing event.
 * Accepts multipart/form-data: title, description, date, existingImages[], images[]
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, description, date } = req.body;
        // existingImages will be sent as an array of strings or a single string
        let existingImages: string[] = [];
        if (req.body.existingImages) {
            existingImages = Array.isArray(req.body.existingImages)
                ? req.body.existingImages
                : [req.body.existingImages];
        }

        const EventModel = getEventModel();
        const event = await EventModel.findById(id);

        if (!event) {
            res.status(404).json({
                success: false,
                error: 'Event not found',
                code: 'NOT_FOUND',
            });
            return;
        }

        // Validate required fields
        if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
            res.status(400).json({ success: false, error: 'Title cannot be empty', code: 'VALIDATION_ERROR' });
            return;
        }

        let parsedDate = event.date;
        if (date) {
            parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                res.status(400).json({ success: false, error: 'Invalid date format', code: 'VALIDATION_ERROR' });
                return;
            }
        }

        // Handle images: delete images that were removed by the admin
        const imagesToDelete = event.images.filter(img => !existingImages.includes(img));
        for (const imgPath of imagesToDelete) {
            const fullPath = path.join(__dirname, '..', '..', imgPath);
            if (fs.existsSync(fullPath)) {
                try { fs.unlinkSync(fullPath); } catch (e) { console.warn(`Could not delete image: ${fullPath}`, e); }
            }
        }

        // Process newly uploaded images
        const uploadedFiles = (req.files as Express.Multer.File[]) || [];
        const newImagePaths: string[] = [];
        for (const file of uploadedFiles) {
            try {
                const publicPath = await compressAndSaveImage(file.buffer, file.originalname);
                newImagePaths.push(publicPath);
            } catch (imgErr) {
                console.error(`Failed to process new image ${file.originalname}:`, imgErr);
            }
        }

        const finalImages = [...existingImages, ...newImagePaths];

        // Update the event
        if (title !== undefined) event.title = title.trim();
        if (description !== undefined) event.description = String(description).trim() || undefined;
        if (date) event.date = parsedDate;
        event.images = finalImages;

        await event.save();

        res.json({
            success: true,
            message: 'Event updated successfully',
            event: {
                _id: event._id,
                title: event.title,
                description: event.description,
                date: event.date,
                images: event.images,
                updatedAt: event.updatedAt,
            },
        });
    } catch (error) {
        console.error('updateEvent error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update event',
            code: 'INTERNAL_ERROR',
        });
    }
};
