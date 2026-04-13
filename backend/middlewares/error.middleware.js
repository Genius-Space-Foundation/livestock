const logger = require('../config/logger');
const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  // Handle Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint failed
      statusCode = 409;
      const target = err.meta?.target;
      message = `Duplicate field value entered. Target: ${target}`;
    } else if (err.code === 'P2025') {
      // Record not found
      statusCode = 404;
      message = 'Resource not found';
    } else {
      statusCode = 400;
      message = `Database Error: ${err.message}`;
    }
  }

  // Handle Prisma Validation Errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided to database';
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    const errorsList = err.issues || err.errors || [];
    message = errorsList.map(e => e.message).join(', ') || err.message;
  }

  // Log to winston
  logger.error(`Error: ${message} - Stack: ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
