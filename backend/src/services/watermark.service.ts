import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import sharp from 'sharp';

export interface WatermarkOptions {
    userId: string;
    userEmail: string;
    userName: string;
    watermarkId: string;
    timestamp: Date;
    institution?: string;
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
    const watermarkText = buildWatermarkText(options);

    for (const page of pages) {
        const { width, height } = page.getSize();

        // Diagonal watermark across page
        const fontSize = 12;
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);

        // Draw semi-transparent diagonal watermark
        page.drawText(watermarkText, {
            x: width / 2 - textWidth / 2,
            y: height / 2,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0.7, 0.7, 0.7),
            opacity: 0.15,
            rotate: degrees(-45),
        });

        // Draw watermark ID at corners
        const cornerFontSize = 8;
        const cornerText = `ID: ${options.watermarkId}`;

        // Bottom left
        page.drawText(cornerText, {
            x: 20,
            y: 20,
            size: cornerFontSize,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: 0.3,
        });

        // Top right
        page.drawText(cornerText, {
            x: width - helveticaFont.widthOfTextAtSize(cornerText, cornerFontSize) - 20,
            y: height - 30,
            size: cornerFontSize,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: 0.3,
        });

        // Footer with date and email
        const footerText = `${options.userEmail} | ${options.timestamp.toISOString().split('T')[0]}`;
        page.drawText(footerText, {
            x: width / 2 - helveticaFont.widthOfTextAtSize(footerText, cornerFontSize) / 2,
            y: 10,
            size: cornerFontSize,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: 0.3,
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
    const parts = [
        options.userName,
        options.userEmail,
        options.timestamp.toISOString().split('T')[0],
        options.watermarkId.substring(0, 8),
    ];

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
