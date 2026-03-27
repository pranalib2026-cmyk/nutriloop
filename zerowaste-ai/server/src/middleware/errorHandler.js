export const errorHandler = (err, req, res, next) => {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  // Log the error for backend visibility
  console.error(`❌ [${req.method}] ${req.path} >> Status ${status}: ${message}`);
  if (status >= 500 && err.stack) {
    console.error(err.stack); // Print full trace for server errors
  }
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
