/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const { errorResponse } = require('../utils/apiResponse');

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  // Google auth errors
  if (err.message === 'Invalid Google token') {
    return errorResponse(res, 'Google authentication failed', 401);
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return errorResponse(res, 'Resource already exists', 409);
  }

  if (err.code === '23503') { // Foreign key violation
    return errorResponse(res, 'Referenced resource not found', 404);
  }

  if (err.code === '22P02') { // Invalid text representation
    return errorResponse(res, 'Invalid data format', 400);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 400, err.details);
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return errorResponse(res, 'CORS policy violation', 403);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  return errorResponse(res, message, statusCode);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.method} ${req.path} not found`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
