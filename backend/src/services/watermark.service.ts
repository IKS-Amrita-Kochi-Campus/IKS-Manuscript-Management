import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import sharp from 'sharp';

export interface WatermarkOptions {
    userId: string;
    userEmail: string;
    userName: string;
    watermarkId: string;
    timestamp: Date;
    institution?: string;
    customText?: string;
    fontSize?: number;
    opacity?: number;
    color?: string; // Hex color
    position?: 'diagonal' | 'original' | 'bottom' | 'top';
    includeUserId?: boolean;
    includeTimestamp?: boolean;
    logoPath?: string; // Path to logo file
    logoOpacity?: number;
    logoPosition?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Apply watermark to PDF
 */
export async function watermarkPdf(
    pdfBuffer: Buffer,
    options: WatermarkOptions
): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();

    // Default settings
    const fontSize = 10; // Small, readable text for header/footer

    // Get text from reusable function
    const watermarkText = buildWatermarkText(options);

    // Load Amrita Logo
    let amritaLogoImage = null;

    try {
        const fs = await import('fs');
        const path = await import('path');
        const projectRoot = process.cwd();

        // Path to the Amrita logo
        const amritaFullPath = path.join(projectRoot, 'src', 'assets', 'amrita.webp');

        if (fs.existsSync(amritaFullPath)) {
            const rawBuffer = fs.readFileSync(amritaFullPath);

            // Convert WebP to PNG using Sharp because pdf-lib requires PNG or JPG
            // Also applying grayscale to make it look like a standard watermark
            const pngBuffer = await sharp(rawBuffer)
                .grayscale()
                .png()
                .toBuffer();

            amritaLogoImage = await pdfDoc.embedPng(pngBuffer);
        }
    } catch (e) {
        console.error('Failed to load watermark logo:', e);
    }

    for (const page of pages) {
        const { width, height } = page.getSize();

        // 1. Draw Amrita Logo in the Center
        if (amritaLogoImage) {
            // Set a substantial size for the center watermark
            const targetWidth = width * 0.6; // Slightly larger
            const scale = targetWidth / amritaLogoImage.width;
            const logoWidth = amritaLogoImage.width * scale;
            const logoHeight = amritaLogoImage.height * scale;

            page.drawImage(amritaLogoImage, {
                x: (width - logoWidth) / 2,
                y: (height - logoHeight) / 2,
                width: logoWidth,
                height: logoHeight,
                opacity: 0.3, // Darker watermark
            });
        }

        // 2. Draw Top and Bottom Text
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);

        // Settings for text
        const textOptions = {
            size: fontSize,
            font: helveticaFont,
            color: rgb(0.2, 0.2, 0.2), // Dark gray, "like in the image" (dark logo mentioned, assuming dark text too)
            opacity: 1, // Full visibility for instructions/info
        };

        // Top Text (with some margin)
        page.drawText(watermarkText, {
            x: (width - textWidth) / 2, // Centered
            y: height - 20, // 20 units from top
            ...textOptions
        });

        // Bottom Text (with some margin)
        page.drawText(watermarkText, {
            x: (width - textWidth) / 2, // Centered
            y: 20, // 20 units from bottom
            ...textOptions
        });
    }

    return Buffer.from(await pdfDoc.save());
}

/**
 * Apply watermark to image
 */
export async function watermarkImage(
    imageBuffer: Buffer,
    options: WatermarkOptions
): Promise<Buffer> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const width = metadata.width || 800;
    const height = metadata.height || 600;

    const watermarkText = buildWatermarkText(options);
    const fontSize = Math.max(12, Math.min(width, height) / 50);

    // Create SVG watermark overlay
    const svgWatermark = `
    <svg width="${width}" height="${height}">
      <style>
        .watermark { 
          fill: rgba(128, 128, 128, 0.2);
          font-family: Arial, sans-serif;
          font-size: ${fontSize}px;
        }
      </style>
      <defs>
        <pattern id="watermarkPattern" 
          width="${width / 2}" height="${height / 3}" 
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-30)">
          <text x="10" y="50" class="watermark">${escapeXml(watermarkText)}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#watermarkPattern)" />
      <text x="10" y="${height - 10}" class="watermark" style="font-size: ${fontSize * 0.7}px;">
        ID: ${escapeXml(options.watermarkId)}
      </text>
    </svg>
  `;

    return image
        .composite([{
            input: Buffer.from(svgWatermark),
            gravity: 'center' as any,
        }])
        .toBuffer();
}

/**
 * Add invisible watermark metadata to file
 */
export function createWatermarkMetadata(options: WatermarkOptions): Record<string, string> {
    return {
        'watermark-id': options.watermarkId,
        'watermark-user': options.userId,
        'watermark-email': options.userEmail,
        'watermark-timestamp': options.timestamp.toISOString(),
        'watermark-institution': options.institution || '',
    };
}

/**
 * Build watermark text from options
 */
function buildWatermarkText(options: WatermarkOptions): string {
    const dateStr = options.timestamp.toISOString().split('T')[0];
    const websiteUrl = 'https://ikskochi.org';
    return `Amrita Vishwa Vidyapeetham, Kochi | Uploaded by - ${options.userName} | ${dateStr} | ${websiteUrl}`;
}

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Extract watermark ID from watermarked PDF (for forensic purposes)
 */
export async function extractWatermarkId(pdfBuffer: Buffer): Promise<string | null> {
    try {
        try {
            // const pdfDoc = await PDFDocument.load(pdfBuffer);
            // Functionality temporarily disabled due to PDF-Lib limitations
            return null;
        } catch {
            return null;
        }

        return null;
    } catch {
        return null;
    }
}
