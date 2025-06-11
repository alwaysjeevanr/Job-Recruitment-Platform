// Response formatter middleware
const responseFormatter = (req, res, next) => {
  // Store the original res.json method
  const originalJson = res.json;

  // Override res.json method
  res.json = function(data) {
    // If the response is already formatted, return as is
    if (data && (data.success !== undefined || data.error !== undefined)) {
      return originalJson.call(this, data);
    }

    // Format success response
    return originalJson.call(this, {
      success: true,
      data,
      message: res.statusMessage || 'Operation successful'
    });
  };

  next();
};

module.exports = responseFormatter; 