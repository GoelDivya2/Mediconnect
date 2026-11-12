import jwt from "jsonwebtoken";

import User from "../models/User.js";

// 1. Authentication Middleware

export const protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization;

    if (!h?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please log in to continue",
      });
    }

    const { id } = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET);

    req.user = await User.findById(id);

    if (!req.user) {
      return res.status(401).json({
        message: "Account no longer exists",
      });
    }

    next();
  } catch {
    res.status(401).json({
      message: "Session expired, please log in again",
    });
  }
};

// 2. Role-Based Authorization Middleware

export const allow =
  (...roles) =>
  (req, res, next) => {
    return roles.includes(req.user.role)
      ? next()
      : res.status(403).json({
          message: "You do not have access to this action",
        });
  };
