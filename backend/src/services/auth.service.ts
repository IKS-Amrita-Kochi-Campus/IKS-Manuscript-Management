import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { userRepo, sessionRepo } from '../repositories/postgres.repository.js';

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    institution?: string;
    designation?: string;
    researchInterests?: string;
    phone?: string;
}

interface AuthResult {
    success: boolean;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        isEmailVerified: boolean;
        verificationStatus: string;
    };
    tokens?: {
        accessToken: string;
        refreshToken: string;
    };
    error?: string;
    code?: string;
}

/**
 * Register a new user
 */
export async function register(
    data: RegisterData,
    ipAddress: string,
    userAgent: string
): Promise<AuthResult> {
    // Check if email already exists
    const existingUser = await userRepo.findByEmail(data.email);
    if (existingUser) {
        return {
            success: false,
            error: 'Email already registered',
            code: 'EMAIL_EXISTS',
        };
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
        return {
            success: false,
            error: passwordValidation.errors.join('. '),
            code: 'WEAK_PASSWORD',
        };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await userRepo.create({
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        first_name: data.firstName,
        last_name: data.lastName,
        institution: data.institution,
        designation: data.designation,
        research_interests: data.researchInterests,
        phone: data.phone,
        email_verification_token: emailVerificationToken,
        email_verification_expiry: emailVerificationExpiry,
    });

    // TODO: Send verification email

    return {
        success: true,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isEmailVerified: user.is_email_verified,
            verificationStatus: user.verification_status,
        },
    };
}

/**
 * Login user
 */
export async function login(
    data: { email: string; password: string },
    ipAddress: string,
    userAgent: string
): Promise<AuthResult> {
    // Find user
    const user = await userRepo.findByEmail(data.email);
    if (!user) {
        return {
            success: false,
            error: 'Account not registered. Please sign up.',
            code: 'USER_NOT_FOUND',
        };
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
        return {
            success: false,
            error: `Account is locked. Try again in ${remainingMinutes} minutes.`,
            code: 'ACCOUNT_LOCKED',
        };
    }

    // Check if account is active
    if (!user.is_active) {
        return {
            success: false,
            error: 'Account has been deactivated',
            code: 'ACCOUNT_DEACTIVATED',
        };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(data.password, user.password_hash);
    if (!isPasswordValid) {
        // Increment failed attempts
        const failedAttempts = user.failed_login_attempts + 1;
        const updateData: { failed_login_attempts: number; locked_until?: Date } = {
            failed_login_attempts: failedAttempts,
        };

        if (failedAttempts >= config.lockout.maxAttempts) {
            updateData.locked_until = new Date(Date.now() + config.lockout.duration);
        }

        await userRepo.update(user.id, updateData);

        return {
            success: false,
            error: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
        };
    }

    // Reset failed attempts and update login info
    await userRepo.update(user.id, {
        failed_login_attempts: 0,
        locked_until: undefined,
        last_login_at: new Date(),
        last_login_ip: ipAddress,
    });

    // Check concurrent sessions limit
    const activeSessions = await sessionRepo.countActiveByUserId(user.id);

    if (activeSessions >= config.session.maxConcurrent) {
        // Invalidate oldest session
        await sessionRepo.invalidateOldestForUser(user.id);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
    });

    // Create session
    await sessionRepo.create({
        user_id: user.id,
        refresh_token: refreshToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
        success: true,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isEmailVerified: user.is_email_verified,
            verificationStatus: user.verification_status,
        },
        tokens: {
            accessToken,
            refreshToken,
        },
    };
}

/**
 * Logout user
 */
export async function logout(sessionId: string): Promise<void> {
    await sessionRepo.invalidate(sessionId);
}

/**
 * Refresh access token
 */
export async function refreshToken(
    token: string,
    ipAddress: string,
    userAgent: string
): Promise<AuthResult> {
    // Verify refresh token
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
        return {
            success: false,
            error: 'Invalid refresh token',
            code: 'INVALID_TOKEN',
        };
    }

    // Find session
    const session = await sessionRepo.findByRefreshToken(token);

    if (!session) {
        return {
            success: false,
            error: 'Session expired or invalid',
            code: 'SESSION_INVALID',
        };
    }

    // Find user
    const user = await userRepo.findById(session.user_id);
    if (!user || !user.is_active) {
        await sessionRepo.invalidate(session.id);
        return {
            success: false,
            error: 'User not found or inactive',
            code: 'USER_INVALID',
        };
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
        userId: user.id,
    });

    // Update session with new refresh token
    await sessionRepo.update(session.id, {
        refresh_token: newRefreshToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
        success: true,
        tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        },
    };
}

/**
 * Verify email
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string; code?: string }> {
    const user = await userRepo.findByVerificationToken(token);

    if (!user) {
        return {
            success: false,
            error: 'Invalid or expired verification token',
            code: 'INVALID_TOKEN',
        };
    }

    await userRepo.update(user.id, {
        is_email_verified: true,
        email_verification_token: undefined,
        email_verification_expiry: undefined,
    });

    return { success: true };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
    const user = await userRepo.findByEmail(email);
    if (!user) {
        // Don't reveal if email exists
        return;
    }

    const resetToken = uuidv4();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepo.update(user.id, {
        password_reset_token: resetToken,
        password_reset_expiry: resetExpiry,
    });

    // TODO: Send password reset email
}

/**
 * Reset password
 */
export async function resetPassword(
    token: string,
    newPassword: string
): Promise<{ success: boolean; error?: string; code?: string }> {
    const user = await userRepo.findByPasswordResetToken(token);

    if (!user) {
        return {
            success: false,
            error: 'Invalid or expired reset token',
            code: 'INVALID_TOKEN',
        };
    }

    // Validate password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
        return {
            success: false,
            error: validation.errors.join('. '),
            code: 'WEAK_PASSWORD',
        };
    }

    const passwordHash = await hashPassword(newPassword);

    // Update password and invalidate all sessions
    await userRepo.update(user.id, {
        password_hash: passwordHash,
        password_reset_token: undefined,
        password_reset_expiry: undefined,
    });

    await sessionRepo.invalidateAllForUser(user.id);

    return { success: true };
}
