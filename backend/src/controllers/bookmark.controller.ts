import { Request, Response } from 'express';
import { getPgPool } from '../config/database.js';

// Get all bookmarks for the current user
export async function getBookmarks(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const pool = getPgPool();
        const result = await pool.query(
            `SELECT id, manuscript_id, notes, created_at 
             FROM bookmarks 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            bookmarks: result.rows,
            total: result.rows.length,
        });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch bookmarks' });
    }
}

// Check if a manuscript is bookmarked
export async function checkBookmark(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        const { manuscriptId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const pool = getPgPool();
        const result = await pool.query(
            `SELECT id FROM bookmarks WHERE user_id = $1 AND manuscript_id = $2`,
            [userId, manuscriptId]
        );

        res.json({
            success: true,
            isBookmarked: result.rows.length > 0,
            bookmarkId: result.rows[0]?.id || null,
        });
    } catch (error) {
        console.error('Check bookmark error:', error);
        res.status(500).json({ success: false, error: 'Failed to check bookmark' });
    }
}

// Add a bookmark
export async function addBookmark(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        const { manuscriptId, notes } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        if (!manuscriptId) {
            res.status(400).json({ success: false, error: 'Manuscript ID is required' });
            return;
        }

        const pool = getPgPool();

        // Check if already bookmarked
        const existing = await pool.query(
            `SELECT id FROM bookmarks WHERE user_id = $1 AND manuscript_id = $2`,
            [userId, manuscriptId]
        );

        if (existing.rows.length > 0) {
            res.json({
                success: true,
                message: 'Already bookmarked',
                bookmark: existing.rows[0],
            });
            return;
        }

        // Add bookmark
        const result = await pool.query(
            `INSERT INTO bookmarks (user_id, manuscript_id, notes) 
             VALUES ($1, $2, $3) 
             RETURNING id, manuscript_id, notes, created_at`,
            [userId, manuscriptId, notes || null]
        );

        res.status(201).json({
            success: true,
            message: 'Bookmark added',
            bookmark: result.rows[0],
        });
    } catch (error) {
        console.error('Add bookmark error:', error);
        res.status(500).json({ success: false, error: 'Failed to add bookmark' });
    }
}

// Remove a bookmark
export async function removeBookmark(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        const { manuscriptId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const pool = getPgPool();
        const result = await pool.query(
            `DELETE FROM bookmarks WHERE user_id = $1 AND manuscript_id = $2 RETURNING id`,
            [userId, manuscriptId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Bookmark not found' });
            return;
        }

        res.json({
            success: true,
            message: 'Bookmark removed',
        });
    } catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({ success: false, error: 'Failed to remove bookmark' });
    }
}

// Toggle bookmark (add if not exists, remove if exists)
export async function toggleBookmark(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;
        const { manuscriptId } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        if (!manuscriptId) {
            res.status(400).json({ success: false, error: 'Manuscript ID is required' });
            return;
        }

        const pool = getPgPool();

        // Check if bookmarked
        const existing = await pool.query(
            `SELECT id FROM bookmarks WHERE user_id = $1 AND manuscript_id = $2`,
            [userId, manuscriptId]
        );

        if (existing.rows.length > 0) {
            // Remove bookmark
            await pool.query(
                `DELETE FROM bookmarks WHERE user_id = $1 AND manuscript_id = $2`,
                [userId, manuscriptId]
            );
            res.json({
                success: true,
                isBookmarked: false,
                message: 'Bookmark removed',
            });
        } else {
            // Add bookmark
            const result = await pool.query(
                `INSERT INTO bookmarks (user_id, manuscript_id) 
                 VALUES ($1, $2) 
                 RETURNING id, manuscript_id, created_at`,
                [userId, manuscriptId]
            );
            res.json({
                success: true,
                isBookmarked: true,
                message: 'Bookmark added',
                bookmark: result.rows[0],
            });
        }
    } catch (error) {
        console.error('Toggle bookmark error:', error);
        res.status(500).json({ success: false, error: 'Failed to toggle bookmark' });
    }
}
