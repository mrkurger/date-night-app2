import { Request, Response, NextFunction } from 'express';

export interface URLValidationOptions {
  blockPatterns?: RegExp[];
  allowedProtocols?: string[];
}

export const urlValidator = (options: URLValidationOptions = {}) => {
  const defaultBlockPatterns = [/git\.new\//, /:\/\//];
  const defaultAllowedProtocols = ['http:', 'https:'];

  const blockPatterns = options.blockPatterns || defaultBlockPatterns;
  const allowedProtocols = options.allowedProtocols || defaultAllowedProtocols;

  return (req: Request, res: Response, next: NextFunction) => {
    const rawUrl = req.originalUrl;
    let decodedUrl: string;

    try {
      decodedUrl = decodeURIComponent(rawUrl);
    } catch (_) {
      decodedUrl = rawUrl;
      console.warn(`[Route Warning] Failed to decode URL: ${rawUrl}`);
    }

    // Block known problematic patterns
    if (blockPatterns.some(pattern => pattern.test(decodedUrl))) {
      console.warn(`[Route Warning] Blocking problematic URL pattern: ${decodedUrl}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
        message: 'URL contains invalid patterns',
      });
    }

    // Additional validation for URLs with protocols
    if (decodedUrl.includes(':')) {
      const hasValidProtocol = allowedProtocols.some(protocol => decodedUrl.startsWith(protocol));
      const isValidApiRoute = /^\/api\/[^/]+\/[^/]+:[\w-]+/.test(decodedUrl);

      if (!hasValidProtocol && !isValidApiRoute) {
        console.warn(`[Route Warning] Invalid protocol in URL: ${decodedUrl}`);
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format',
          message: 'URL contains invalid protocol',
        });
      }
    }

    next();
  };
};
