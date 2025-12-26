import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './index.js';

// S3/MinIO Client
export const s3Client = new S3Client({
    endpoint: config.storage.endpoint,
    region: config.storage.region,
    credentials: {
        accessKeyId: config.storage.accessKey,
        secretAccessKey: config.storage.secretKey,
    },
    forcePathStyle: true, // Required for MinIO
});

export const storageBucket = config.storage.bucket;

// Helper functions for S3 operations
export const uploadToStorage = async (
    key: string,
    body: Buffer,
    contentType: string,
    metadata?: Record<string, string>
): Promise<void> => {
    const command = new PutObjectCommand({
        Bucket: storageBucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
    });
    await s3Client.send(command);
};

export const getFromStorage = async (key: string): Promise<Buffer> => {
    const command = new GetObjectCommand({
        Bucket: storageBucket,
        Key: key,
    });
    const response = await s3Client.send(command);
    const chunks: Uint8Array[] = [];

    if (response.Body) {
        const stream = response.Body as AsyncIterable<Uint8Array>;
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
    }

    return Buffer.concat(chunks);
};

export const deleteFromStorage = async (key: string): Promise<void> => {
    const command = new DeleteObjectCommand({
        Bucket: storageBucket,
        Key: key,
    });
    await s3Client.send(command);
};

export const getSignedDownloadUrl = async (
    key: string,
    expiresIn: number = 3600
): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: storageBucket,
        Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
};

export const objectExists = async (key: string): Promise<boolean> => {
    try {
        const command = new HeadObjectCommand({
            Bucket: storageBucket,
            Key: key,
        });
        await s3Client.send(command);
        return true;
    } catch {
        return false;
    }
};
