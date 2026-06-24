function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err.message);
  console.error(err.stack);
  res.status(500).json({
    is_success: false,
    message: 'Internal server error',
  });
}

module.exports = errorHandler;
