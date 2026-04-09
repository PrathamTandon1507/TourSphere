const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const fields = Object.keys(err.keyValue);
  
  if (fields.includes('tour') && fields.includes('user')) {
    return new AppError('You have already reviewed this tour!', 400);
  }

  const field = fields[0];
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate ${field}: ${value}. Please use a unique value.`;
  return new AppError(message, 400);
};

const handleValidationDB = (err) => {
  // Extract individual validation error messages
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400); // Changed from 404 to 400
};

const sendErrDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.error('ERROR 💥', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        title: 'Something went wrong!',
        msg: err.message,
      });
    }
    // Programming or other unknown error: don't leak error details

    console.error('ERROR 💥', err);

    // Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err);

  // Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later.',
  });
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again', 401);

const handleJWTExpired = () =>
  new AppError('Your token has expired! Please log in again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log('=== DEBUGGING ERROR ===');
    // console.log('Error name:', err.name);
    // console.log('Error message:', err.message);
    // console.log('Error code:', err.code);
    // console.log('Has errors property:', !!err.errors);
    // console.log('Full error object:', err);
    // console.log('======================');

    // Create a hard copy of the error
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.code = err.code;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrProd(error, req, res);
  }
};
