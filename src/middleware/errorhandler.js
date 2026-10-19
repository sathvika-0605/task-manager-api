
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message || err);

  // Handle invalid MongoDB ObjectIds or data formats
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID or data format."
    });
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map(
      (error) => error.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: messages
    });
  }

  // Handle duplicate values
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists."
    });
  }

  // Use an explicit status only when it is a valid HTTP error status
  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode <= 599
      ? err.statusCode
      : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode < 500
        ? err.message || "Request failed."
        : "Internal server error."
  });
};

module.exports = errorHandler;
