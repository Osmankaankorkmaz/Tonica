const ApiError = require("../error/ApiError.js");

const GenericErrorHandler = (err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    console.error(err);
  }

  // Mongoose validation mesajlarını sadeleştir
  if (/\w+ validation failed: \w+/i.test(err.message)) {
    err.message = err.message.replace(/\w+ validation failed: \w+/i, "");
  }

  res.status(err.status || 500).json({
    status: err?.status || 500,
    error: err?.message || "Internal Server Error",
    code: err?.code || "Unknown",
  });
};

module.exports = GenericErrorHandler;
