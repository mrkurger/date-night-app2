declare global {
  namespace Express {
    interface Request {
      file?: import('multer').Multer['file'];
      files?: import('multer').Multer['files'];
    }
  }
}

export {};
