exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // If response is already sent, forward to Express default error handler
  if (res.headersSent) {
    return next(err);
  }
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
