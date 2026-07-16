import jwt from "jsonwebtoken";

import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (request, response, next) => {
  const authorizationHeader = request.headers.authorization;

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    response.status(401);

    throw new Error("Authentication token is required");
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    response.status(401);

    throw new Error("Authentication token is missing");
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decodedToken.userId);

  if (!user || !user.isActive) {
    response.status(401);

    throw new Error("User account is unavailable");
  }

  request.user = user;

  next();
});

const requireRole = (...allowedRoles) => {
  return (request, response, next) => {
    if (!request.user) {
      response.status(401);

      next(new Error("Authentication is required"));
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      response.status(403);

      next(
        new Error(
          "You do not have permission to access this resource"
        )
      );

      return;
    }

    next();
  };
};

export { protect, requireRole };