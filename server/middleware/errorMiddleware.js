const notFoundHandler = (request, response, next) => {
  const error = new Error(
    `Route not found: ${request.method} ${request.originalUrl}`
  );

  response.status(404);
  next(error);
};

const errorHandler = (error, request, response, next) => {
  let statusCode =
    response.statusCode && response.statusCode !== 200
      ? response.statusCode
      : 500;

  let message = error.message || "Internal server error";

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  if (error.code === 11000) {
    statusCode = 409;

    const duplicateFields = Object.keys(error.keyValue || {});

    message =
      duplicateFields.length > 0
        ? `${duplicateFields.join(", ")} already exists`
        : "Duplicate resource";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(", ");
  }

  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  console.error(error);

  response.status(statusCode).json({
    success: false,
    message,
    stack:
      process.env.NODE_ENV === "production"
        ? undefined
        : error.stack,
  });
};

export { notFoundHandler, errorHandler };