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

    // Default settings if not provided
    const fontSize = options.fontSize || 14;
    const opacity = options.opacity !== undefined ? options.opacity : 0.15;
    const colorHex = options.color || '#808080';

    // Parse hex color
    const r = parseInt(colorHex.substring(1, 3), 16) / 255;
    const g = parseInt(colorHex.substring(3, 5), 16) / 255;
    const b = parseInt(colorHex.substring(5, 7), 16) / 255;
    const watermarkColor = rgb(isNaN(r) ? 0.5 : r, isNaN(g) ? 0.5 : g, isNaN(b) ? 0.5 : b);

    // Build watermark text based on settings
    let watermarkText = options.customText || options.institution || 'Confidential';

    /* 
    if (options.includeUserId) {
        watermarkText += ` | ${options.userName} (${options.userId.substring(0, 8)})`;
    }
    */

    if (options.includeTimestamp) {
        watermarkText += ` | ${options.timestamp.toISOString().split('T')[0]}`;
    }

    // Load logo images
    let iksLogoImage = null;
    let amritaLogoImage = null;

    // IKS Logo (Center)
    try {
        const iksLogoPath = 'src/assets/iks.webp'; // Relative to project root when running
        // Ideally we would use fs.readFile, but here we can rely on sharp or just skip if we don't have fs in this context easily.
        // Assuming we are in node environment
        const fs = await import('fs');
        const path = await import('path');
        const projectRoot = process.cwd();

        const iksFullPath = path.join(projectRoot, 'src', 'assets', 'iks.webp');
        if (fs.existsSync(iksFullPath)) {
            const iksBuffer = fs.readFileSync(iksFullPath);
            iksLogoImage = await pdfDoc.embedPng(iksBuffer);
        }

        const amritaFullPath = path.join(projectRoot, 'src', 'assets', 'amrita.webp');
        if (fs.existsSync(amritaFullPath)) {
            const amritaBuffer = fs.readFileSync(amritaFullPath);
            amritaLogoImage = await pdfDoc.embedPng(amritaBuffer);
        }
    } catch (e) {
        console.error('Failed to load logos for watermark', e);
    }

    for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);

        // Draw IKS Logo in the center (Background)
        if (iksLogoImage) {
            const logoWidth = 200; // Adjust size as needed
            const logoHeight = (iksLogoImage.height / iksLogoImage.width) * logoWidth;

            page.drawImage(iksLogoImage, {
                x: width / 2 - logoWidth / 2,
                y: height / 2 - logoHeight / 2,
                width: logoWidth,
                height: logoHeight,
                opacity: 0.1, // Very faint background
            });
        }

        // Draw Amrita Logo in the top right
        if (amritaLogoImage) {
            const logoWidth = 120; // Adjust size
            const logoHeight = (amritaLogoImage.height / amritaLogoImage.width) * logoWidth;

            page.drawImage(amritaLogoImage, {
                x: width - logoWidth - 20,
                y: height - logoHeight - 20,
                width: logoWidth,
                height: logoHeight,
                opacity: 0.8, // More visible but still watermark-like
            });
        }

        // 1. Top and Bottom Header/Footer Watermarks
        const headerFooterText = `Amrita Vishwa Vidyapeetham Kochi | Uploaded by: ${options.userName} (${options.userId}) | ${options.timestamp.toISOString().split('T')[0]}`;
        const hfSize = 10;
        const hfWidth = helveticaFont.widthOfTextAtSize(headerFooterText, hfSize);

        // Top
        page.drawText(headerFooterText, {
            x: width / 2 - hfWidth / 2,
            y: height - 20,
            size: hfSize,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: 0.6,
        });

        // Bottom
        page.drawText(headerFooterText, {
            x: width / 2 - hfWidth / 2,
            y: 20,
            size: hfSize,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: 0.6,
        });

        // 2. Vertical Watermarks (3 down the center)
        const verticalText = `Amrita Vishwa Vidyapeetham Kochi | ${options.userName}`;
        const vSize = 16;
        const vTextWidth = helveticaFont.widthOfTextAtSize(verticalText, vSize);

        // Calculate vertical positions (25%, 50%, 75% of height)
        const vPositions = [height * 0.75, height * 0.5, height * 0.25];

        for (const yPos of vPositions) {
            page.drawText(verticalText, {
                x: width / 2, // Centered horizontally (pivot)
                y: yPos - vTextWidth / 2, // Centered vertically relative to text length
                size: vSize,
                font: helveticaFont,
                color: rgb(0.8, 0.8, 0.8), // Faint gray
                opacity: 0.25,
                rotate: degrees(90), // Vertical orientation
            });
        }
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
    const parts: string[] = [];

    // Institution watermark is the main text
    if (options.institution) {
        parts.push(options.institution);
    }

    // Add user info and tracking data
    parts.push(options.userName);
    parts.push(options.userEmail);
    parts.push(options.timestamp.toISOString().split('T')[0]);
    // parts.push(options.watermarkId.substring(0, 8)); // Removed visible tracking ID

    return parts.join(' | ');
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
