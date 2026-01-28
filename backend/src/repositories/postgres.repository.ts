import { getPgPool } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Helper to get pool - ensures connection is established
const getPool = () => getPgPool();

// User types
export interface User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: 'VISITOR' | 'USER' | 'OWNER' | 'REVIEWER' | 'ADMIN';
    institution?: string;
    designation?: string;
    research_interests?: string;
    phone?: string;
    address?: string;
    is_email_verified: boolean;
    email_verification_token?: string;
    email_verification_expiry?: Date;
    password_reset_token?: string;
    password_reset_expiry?: Date;
    verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
    identity_document_type?: string;
    identity_document_hash?: string;
    verified_at?: Date;
    verified_by?: string;
    failed_login_attempts: number;
    locked_until?: Date;
    is_active: boolean;
    last_login_at?: Date;
    last_login_ip?: string;
    notification_preferences?: Record<string, boolean>;
    created_at: Date;
    updated_at: Date;
}

export interface Session {
    id: string;
    user_id: string;
    refresh_token: string;
    ip_address: string;
    user_agent?: string;
    is_valid: boolean;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
}

export interface AccessRequest {
    id: string;
    manuscript_id: string;
    requester_id: string;
    requested_level: string;
    purpose: string;
    institution: string;
    justification: string;
    duration?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';
    reviewer_id?: string;
    reviewed_at?: Date;
    review_notes?: string;
    approved_level?: string;
    approved_duration?: number;
    created_at: Date;
    updated_at: Date;
}

export interface ManuscriptAccess {
    id: string;
    manuscript_id: string;
    user_id: string;
    access_level: string;
    granted_by: string;
    granted_at: Date;
    expires_at?: Date;
    is_active: boolean;
    revoked_at?: Date;
    revoked_by?: string;
    revoke_reason?: string;
    watermark_id: string;
    view_count: number;
    download_count: number;
    last_accessed_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface VerificationDocument {
    id: string;
    user_id: string;
    document_type: string;
    document_hash: string;
    encrypted_path: string;
    original_name: string;
    mime_type: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
    review_notes?: string;
    uploaded_at: Date;
    verified_at?: Date;
    created_at: Date;
    updated_at: Date;
}

// ============ USER REPOSITORY ============

export const userRepo = {
    async findByEmail(email: string): Promise<User | null> {
        const result = await getPool().query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );
        return result.rows[0] || null;
    },

    async findById(id: string): Promise<User | null> {
        const result = await getPool().query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    },

    async create(data: Partial<User>): Promise<User> {
        const id = uuidv4();
        const result = await getPool().query(
            `INSERT INTO users (
        id, email, password_hash, first_name, last_name, role,
        institution, designation, research_interests, phone,
        email_verification_token, email_verification_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
            [
                id,
                data.email?.toLowerCase(),
                data.password_hash,
                data.first_name,
                data.last_name,
                data.role || 'VISITOR',
                data.institution,
                data.designation,
                data.research_interests,
                data.phone,
                data.email_verification_token,
                data.email_verification_expiry,
            ]
        );
        return result.rows[0];
    },

    async update(id: string, data: Partial<User>): Promise<User | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        if (fields.length === 0) return this.findById(id);

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await getPool().query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );
        return result.rows[0] || null;
    },

    async findByVerificationToken(token: string): Promise<User | null> {
        const result = await getPool().query(
            `SELECT * FROM users 
       WHERE email_verification_token = $1 
       AND email_verification_expiry > CURRENT_TIMESTAMP`,
            [token]
        );
        return result.rows[0] || null;
    },

    async findByPasswordResetToken(token: string): Promise<User | null> {
        const result = await getPool().query(
            `SELECT * FROM users 
       WHERE password_reset_token = $1 
       AND password_reset_expiry > CURRENT_TIMESTAMP`,
            [token]
        );
        return result.rows[0] || null;
    },

    async findAll(options: {
        page?: number;
        limit?: number;
        role?: string;
        isActive?: boolean;
        search?: string;
    }): Promise<{ users: User[]; total: number }> {
        const { page = 1, limit = 20, role, isActive, search } = options;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        const params: unknown[] = [];
        let paramIndex = 1;

        if (role) {
            whereClause += ` AND role = $${paramIndex}`;
            params.push(role);
            paramIndex++;
        }
        if (isActive !== undefined) {
            whereClause += ` AND is_active = $${paramIndex}`;
            params.push(isActive);
            paramIndex++;
        }
        if (search) {
            whereClause += ` AND (email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        const countResult = await getPool().query(
            `SELECT COUNT(*) FROM users ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        params.push(limit, offset);
        const result = await getPool().query(
            `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            params
        );

        return { users: result.rows, total };
    },

    async count(where?: Partial<User>): Promise<number> {
        let query = 'SELECT COUNT(*) FROM users';
        const params: unknown[] = [];

        if (where) {
            const conditions: string[] = [];
            let paramIndex = 1;
            Object.entries(where).forEach(([key, value]) => {
                if (value !== undefined) {
                    conditions.push(`${key} = $${paramIndex}`);
                    params.push(value);
                    paramIndex++;
                }
            });
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
        }

        const result = await getPool().query(query, params);
        return parseInt(result.rows[0].count);
    },
};

// ============ SESSION REPOSITORY ============

export const sessionRepo = {
    async create(data: Partial<Session>): Promise<Session> {
        const id = uuidv4();
        const result = await getPool().query(
            `INSERT INTO sessions (id, user_id, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, data.user_id, data.refresh_token, data.ip_address, data.user_agent, data.expires_at]
        );
        return result.rows[0];
    },

    async findByRefreshToken(token: string): Promise<Session | null> {
        const result = await getPool().query(
            `SELECT * FROM sessions 
       WHERE refresh_token = $1 AND is_valid = true AND expires_at > CURRENT_TIMESTAMP`,
            [token]
        );
        return result.rows[0] || null;
    },

    async findById(id: string): Promise<Session | null> {
        const result = await getPool().query('SELECT * FROM sessions WHERE id = $1', [id]);
        return result.rows[0] || null;
    },

    async findValidByUserId(userId: string): Promise<Session | null> {
        const result = await getPool().query(
            `SELECT * FROM sessions 
       WHERE user_id = $1 AND is_valid = true AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
            [userId]
        );
        return result.rows[0] || null;
    },

    async countActiveByUserId(userId: string): Promise<number> {
        const result = await getPool().query(
            `SELECT COUNT(*) FROM sessions 
       WHERE user_id = $1 AND is_valid = true AND expires_at > CURRENT_TIMESTAMP`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    },

    async invalidate(id: string): Promise<void> {
        await getPool().query(
            'UPDATE sessions SET is_valid = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
    },

    async invalidateAllForUser(userId: string, exceptId?: string): Promise<void> {
        if (exceptId) {
            await getPool().query(
                'UPDATE sessions SET is_valid = false WHERE user_id = $1 AND id != $2',
                [userId, exceptId]
            );
        } else {
            await getPool().query(
                'UPDATE sessions SET is_valid = false WHERE user_id = $1',
                [userId]
            );
        }
    },

    async update(id: string, data: Partial<Session>): Promise<Session | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        if (fields.length === 0) return this.findById(id);

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await getPool().query(
            `UPDATE sessions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );
        return result.rows[0] || null;
    },

    async findAllForUser(userId: string): Promise<Session[]> {
        const result = await getPool().query(
            `SELECT * FROM sessions 
       WHERE user_id = $1 AND is_valid = true AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    },

    async invalidateOldestForUser(userId: string): Promise<void> {
        await getPool().query(
            `UPDATE sessions SET is_valid = false 
       WHERE id = (
         SELECT id FROM sessions 
         WHERE user_id = $1 AND is_valid = true 
         ORDER BY created_at ASC LIMIT 1
       )`,
            [userId]
        );
    },
};

// ============ ACCESS REQUEST REPOSITORY ============

export const accessRequestRepo = {
    async create(data: Partial<AccessRequest>): Promise<AccessRequest> {
        const id = uuidv4();
        const result = await getPool().query(
            `INSERT INTO access_requests (
        id, manuscript_id, requester_id, requested_level, purpose, institution, justification, duration
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [id, data.manuscript_id, data.requester_id, data.requested_level, data.purpose, data.institution, data.justification, data.duration]
        );
        return result.rows[0];
    },

    async findById(id: string): Promise<AccessRequest | null> {
        const result = await getPool().query('SELECT * FROM access_requests WHERE id = $1', [id]);
        return result.rows[0] || null;
    },

    async findByManuscriptAndRequester(manuscriptId: string, requesterId: string, status?: string): Promise<AccessRequest | null> {
        let query = 'SELECT * FROM access_requests WHERE manuscript_id = $1 AND requester_id = $2';
        const params: unknown[] = [manuscriptId, requesterId];

        if (status) {
            query += ' AND status = $3';
            params.push(status);
        }

        const result = await getPool().query(query, params);
        return result.rows[0] || null;
    },

    async findByRequester(requesterId: string): Promise<AccessRequest[]> {
        const result = await getPool().query(
            'SELECT * FROM access_requests WHERE requester_id = $1 ORDER BY created_at DESC',
            [requesterId]
        );
        return result.rows;
    },

    async findByManuscript(manuscriptId: string): Promise<AccessRequest[]> {
        const result = await getPool().query(
            'SELECT * FROM access_requests WHERE manuscript_id = $1 ORDER BY created_at DESC',
            [manuscriptId]
        );
        return result.rows;
    },

    async update(id: string, data: Partial<AccessRequest>): Promise<AccessRequest | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        if (fields.length === 0) return this.findById(id);

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await getPool().query(
            `UPDATE access_requests SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );
        return result.rows[0] || null;
    },

    async countPending(): Promise<number> {
        const result = await getPool().query(
            "SELECT COUNT(*) FROM access_requests WHERE status = 'PENDING'"
        );
        return parseInt(result.rows[0].count);
    },

    async findAll(page = 1, limit = 20): Promise<{ requests: AccessRequest[]; total: number }> {
        const offset = (page - 1) * limit;

        const countResult = await getPool().query('SELECT COUNT(*) FROM access_requests');
        const total = parseInt(countResult.rows[0].count);

        const result = await getPool().query(
            'SELECT * FROM access_requests ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        return { requests: result.rows, total };
    },
};

// ============ MANUSCRIPT ACCESS REPOSITORY ============

export const manuscriptAccessRepo = {
    async create(data: Partial<ManuscriptAccess>): Promise<ManuscriptAccess> {
        const id = uuidv4();
        const watermarkId = data.watermark_id || uuidv4();
        const result = await getPool().query(
            `INSERT INTO manuscript_access (
        id, manuscript_id, user_id, access_level, granted_by, expires_at, watermark_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id, data.manuscript_id, data.user_id, data.access_level, data.granted_by, data.expires_at, watermarkId]
        );
        return result.rows[0];
    },

    async findByManuscriptAndUser(manuscriptId: string, userId: string): Promise<ManuscriptAccess | null> {
        const result = await getPool().query(
            `SELECT * FROM manuscript_access 
       WHERE manuscript_id = $1 AND user_id = $2 AND is_active = true
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
            [manuscriptId, userId]
        );
        return result.rows[0] || null;
    },

    async findByWatermarkId(watermarkId: string): Promise<ManuscriptAccess | null> {
        const result = await getPool().query(
            'SELECT * FROM manuscript_access WHERE watermark_id = $1',
            [watermarkId]
        );
        return result.rows[0] || null;
    },

    async update(id: string, data: Partial<ManuscriptAccess>): Promise<ManuscriptAccess | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        if (fields.length === 0) return null;

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await getPool().query(
            `UPDATE manuscript_access SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );
        return result.rows[0] || null;
    },

    async incrementViewCount(watermarkId: string): Promise<void> {
        await getPool().query(
            `UPDATE manuscript_access 
       SET view_count = view_count + 1, last_accessed_at = CURRENT_TIMESTAMP 
       WHERE watermark_id = $1`,
            [watermarkId]
        );
    },

    async incrementDownloadCount(watermarkId: string): Promise<void> {
        await getPool().query(
            `UPDATE manuscript_access 
       SET download_count = download_count + 1, last_accessed_at = CURRENT_TIMESTAMP 
       WHERE watermark_id = $1`,
            [watermarkId]
        );
    },

    async revoke(manuscriptId: string, userId: string, revokedBy: string, reason?: string): Promise<void> {
        await getPool().query(
            `UPDATE manuscript_access 
       SET is_active = false, revoked_at = CURRENT_TIMESTAMP, revoked_by = $3, revoke_reason = $4
       WHERE manuscript_id = $1 AND user_id = $2 AND is_active = true`,
            [manuscriptId, userId, revokedBy, reason]
        );
    },
};

// ============ VERIFICATION DOCUMENT REPOSITORY ============

export const verificationDocRepo = {
    async create(data: Partial<VerificationDocument>): Promise<VerificationDocument> {
        const id = uuidv4();
        const result = await getPool().query(
            `INSERT INTO verification_documents (
        id, user_id, document_type, document_hash, encrypted_path, original_name, mime_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id, data.user_id, data.document_type, data.document_hash, data.encrypted_path, data.original_name, data.mime_type]
        );
        return result.rows[0];
    },

    async findPendingByUserId(userId: string): Promise<VerificationDocument | null> {
        const result = await getPool().query(
            "SELECT * FROM verification_documents WHERE user_id = $1 AND status = 'PENDING'",
            [userId]
        );
        return result.rows[0] || null;
    },

    async findByUserId(userId: string): Promise<VerificationDocument[]> {
        const result = await getPool().query(
            'SELECT * FROM verification_documents WHERE user_id = $1 ORDER BY uploaded_at DESC',
            [userId]
        );
        return result.rows;
    },

    async findAllPending(page = 1, limit = 20): Promise<{ documents: VerificationDocument[]; total: number }> {
        const offset = (page - 1) * limit;

        const countResult = await getPool().query(
            "SELECT COUNT(*) FROM verification_documents WHERE status = 'PENDING'"
        );
        const total = parseInt(countResult.rows[0].count);

        const result = await getPool().query(
            `SELECT * FROM verification_documents WHERE status = 'PENDING' 
       ORDER BY uploaded_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return { documents: result.rows, total };
    },

    async updateByUserId(userId: string, status: string, data: Partial<VerificationDocument>): Promise<void> {
        await getPool().query(
            `UPDATE verification_documents 
       SET status = $2, review_notes = $3, verified_at = $4, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND status = 'PENDING'`,
            [userId, status, data.review_notes, status === 'VERIFIED' ? new Date() : null]
        );
    },

    async countPending(): Promise<number> {
        const result = await getPool().query(
            "SELECT COUNT(*) FROM verification_documents WHERE status = 'PENDING'"
        );
        return parseInt(result.rows[0].count);
    },
};

