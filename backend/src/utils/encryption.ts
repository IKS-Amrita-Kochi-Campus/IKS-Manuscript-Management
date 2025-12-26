import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Derives a key from the master encryption key using scrypt
 */
function deriveKey(salt: Buffer): Buffer {
    return crypto.scryptSync(config.encryption.key, salt, 32);
}

/**
 * Encrypts data using AES-256-GCM
 */
export function encrypt(data: Buffer): { encrypted: Buffer; keyId: string } {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = deriveKey(salt);
    const keyId = crypto.randomBytes(16).toString('hex');

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Combine: salt + iv + authTag + encrypted
    const combined = Buffer.concat([salt, iv, authTag, encrypted]);

    return { encrypted: combined, keyId };
}

/**
 * Decrypts data encrypted with AES-256-GCM
 */
export function decrypt(encryptedData: Buffer): Buffer {
    const salt = encryptedData.subarray(0, SALT_LENGTH);
    const iv = encryptedData.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = encryptedData.subarray(
        SALT_LENGTH + IV_LENGTH,
        SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
    );
    const encrypted = encryptedData.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

    const key = deriveKey(salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Generates a SHA-256 hash of the input
 */
export function hashSHA256(data: Buffer | string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generates a secure random token
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypts a file stream and returns the encrypted content
 */
export async function encryptFile(fileBuffer: Buffer): Promise<{
    encryptedContent: Buffer;
    checksum: string;
    keyId: string;
}> {
    const checksum = hashSHA256(fileBuffer);
    const { encrypted, keyId } = encrypt(fileBuffer);

    return {
        encryptedContent: encrypted,
        checksum,
        keyId,
    };
}

/**
 * Decrypts a file and verifies its checksum
 */
export async function decryptFile(
    encryptedContent: Buffer,
    expectedChecksum: string
): Promise<Buffer> {
    const decrypted = decrypt(encryptedContent);
    const actualChecksum = hashSHA256(decrypted);

    if (actualChecksum !== expectedChecksum) {
        throw new Error('File integrity check failed: checksum mismatch');
    }

    return decrypted;
}
