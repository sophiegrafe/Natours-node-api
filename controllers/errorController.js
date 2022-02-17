const AppError = require('../utils/appError');

/* eslint-disable node/no-unsupported-features/es-syntax */
function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(err) {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value! .`;
  return new AppError(message, 400);
}

function handleValidationErrorDB(err) {
  const invalidData = Object.values(
    err.errors
  ).map((el) => el.message);
  const message = `Invalid input data. ${invalidData.join(
    '. '
  )}`;
  return new AppError(message, 400);
}

function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

function sendErrorProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 🧨🧨🧨', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development')
    sendErrorDev(err, res);

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;

    if (error.name === 'CastError')
      error = handleCastErrorDB(error);
    if (err.code === 11000)
      error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    sendErrorProd(error, res);
  }
};
