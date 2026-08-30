const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server';

  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);

  if (req.headers['accept']?.includes('json')) {
    return res.status(statusCode).json({ error: message });
  }

  res.status(statusCode).render('login', { 
    error: message,
    username: '' 
  });
};

module.exports = errorHandler;
