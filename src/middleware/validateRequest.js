function validateRequest(req, res, next) {
  if (!req.body || !Array.isArray(req.body.data)) {
    return res.status(400).json({
      is_success: false,
      message: 'Invalid request: "data" must be an array',
    });
  }
  next();
}

module.exports = validateRequest;
