import { NextRequest, NextResponse } from 'next/server';
import { getPlaiceholder } from 'plaiceholder';
import sharp from 'sharp';

/**
 * Image Optimization API
 *
 * This API handles image optimizations including:
 * - Resizing
 * - Format conversion (WebP, AVIF)
 * - Quality adjustment
 * - Generating blurhash placeholders
 *
 * Query parameters:
 * - url: The source image URL to optimize (required)
 * - w: Width in pixels (optional, default: original width)
 * - h: Height in pixels (optional, default: maintain aspect ratio)
 * - q: Quality from 1-100 (optional, default: 80)
 * - format: Output format (webp, avif, jpeg, png) (optional, default: webp)
 * - blur: Generate blurhash placeholder (optional, default: false)
 * - cache: Cache control max-age in seconds (optional, default: 86400 - 1 day)
 */
export async function GET(request: NextRequest) {
  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const width = searchParams.get('w') ? parseInt(searchParams.get('w') as string, 10) : undefined;
  const height = searchParams.get('h') ? parseInt(searchParams.get('h') as string, 10) : undefined;
  const quality = searchParams.get('q') ? parseInt(searchParams.get('q') as string, 10) : 80;
  const format = searchParams.get('format') || 'webp';
  const generateBlur = searchParams.get('blur') === 'true';
  const cacheMaxAge = searchParams.get('cache')
    ? parseInt(searchParams.get('cache') as string, 10)
    : 86400; // Default 1 day

  // Validate required parameters
  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing required parameter: url' }, { status: 400 });
  }

  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}` },
        { status: 500 },
      );
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Base image processing pipeline
    let imageProcess = sharp(imageBuffer);

    // Resize if requested
    if (width || height) {
      imageProcess = imageProcess.resize({
        width,
        height,
        fit: 'cover',
        position: 'center',
      });
    }

    // Process according to requested format
    let outputBuffer;
    const formatOptions = { quality };

    switch (format) {
      case 'webp':
        outputBuffer = await imageProcess.webp(formatOptions).toBuffer();
        break;
      case 'avif':
        outputBuffer = await imageProcess.avif(formatOptions).toBuffer();
        break;
      case 'jpeg':
      case 'jpg':
        outputBuffer = await imageProcess.jpeg(formatOptions).toBuffer();
        break;
      case 'png':
        outputBuffer = await imageProcess.png({ quality: Math.floor(quality / 10) }).toBuffer();
        break;
      default:
        outputBuffer = await imageProcess.webp(formatOptions).toBuffer();
    }

    // Generate placeholder data if requested
    let placeholderData = null;
    if (generateBlur) {
      try {
        const { base64 } = await getPlaiceholder(outputBuffer);
        placeholderData = base64;
      } catch (e) {
        console.error('Failed to generate placeholder:', e);
      }
    }

    // Return optimized image with appropriate headers
    if (placeholderData) {
      return NextResponse.json(
        { image: outputBuffer.toString('base64'), placeholder: placeholderData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${cacheMaxAge}`,
          },
        },
      );
    } else {
      return new NextResponse(outputBuffer, {
        headers: {
          'Content-Type': `image/${format.replace('jpg', 'jpeg')}`,
          'Cache-Control': `public, max-age=${cacheMaxAge}`,
        },
      });
    }
  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
