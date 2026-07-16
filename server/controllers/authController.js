import jwt from "jsonwebtoken";

import User from "../models/User.js";
import generateUniqueNaradaId from "../../services/naradaIdService.js";
import asyncHandler from "../utils/asyncHandler.js";

const createToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const normalizeEmail = (email = "") => {
  return email.trim().toLowerCase();
};

const registerUser = asyncHandler(async (request, response) => {
  const {
    name,
    email,
    phone,
    password,
    role = "civilian",
    emergencyContact,
  } = request.body;

  if (!name?.trim()) {
    response.status(400);

    throw new Error("Name is required");
  }

  if (!email?.trim()) {
    response.status(400);

    throw new Error("Email is required");
  }

  if (!password) {
    response.status(400);

    throw new Error("Password is required");
  }

  if (password.length < 8) {
    response.status(400);

    throw new Error("Password must contain at least 8 characters");
  }

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    response.status(409);

    throw new Error("An account with this email already exists");
  }

  const allowedRegistrationRoles = [
    "civilian",
    "responder",
    "hospital",
    "police",
    "shelter",
  ];

  const selectedRole = allowedRegistrationRoles.includes(role)
    ? role
    : "civilian";

  const naradaId = await generateUniqueNaradaId();

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone?.trim() || "",
    password,
    role: selectedRole,
    naradaId,
    emergencyContact: {
      name: emergencyContact?.name?.trim() || "",
      phone: emergencyContact?.phone?.trim() || "",
      relationship:
        emergencyContact?.relationship?.trim() || "",
    },
  });

  const token = createToken(user._id.toString());

  response.status(201).json({
    success: true,
    message: "Narada identity created successfully",
    token,
    user: user.toSafeObject(),
  });
});

const loginUser = asyncHandler(async (request, response) => {
  const { email, password } = request.body;

  if (!email?.trim() || !password) {
    response.status(400);

    throw new Error("Email and password are required");
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    response.status(401);

    throw new Error("Invalid email or password");
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    response.status(401);

    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    response.status(403);

    throw new Error("This account has been disabled");
  }

  user.lastLoginAt = new Date();

  await user.save({
    validateBeforeSave: false,
  });

  const token = createToken(user._id.toString());

  response.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: user.toSafeObject(),
  });
});

const getCurrentUser = asyncHandler(async (request, response) => {
  response.status(200).json({
    success: true,
    user: request.user.toSafeObject(),
  });
});

const logoutUser = asyncHandler(async (request, response) => {
  /*
   * JWT logout is handled on the client by deleting the token.
   * A token blacklist can be added later if needed.
   */

  response.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
};