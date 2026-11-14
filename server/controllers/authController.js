import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Error Helper

export const fail = (res, code, message) => {
  res.status(code);
  throw new Error(message);
};

// Doctor Fields

const DOC_FIELDS = [
  "specialization",
  "qualification",
  "experience",
  "certification",
  "clinicName",
  "clinicAddress",
  "city",
  "locality",
  "state",
  "pincode",
  "consultationFee",
  "clinicTimings",
  "slotDuration",
];

// Pick Fields

const pick = (obj, fields) => {
  const data = {};

  fields.forEach((field) => {
    if (obj[field] !== undefined) {
      data[field] = obj[field];
    }
  });

  return data;
};

// Register

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      fail(res, 400, "Name, email and password are required");

    if (!["doctor", "patient"].includes(role))
      fail(res, 400, "Role must be doctor or patient");

    if (!/^\S+@\S+\.\S+$/.test(email)) fail(res, 400, "Enter a valid email");

    if (password.length < 6)
      fail(res, 400, "Password must be at least 6 characters");

    const fields = ["name", "email", "password", "role", "phone"];

    if (role === "doctor") {
      fields.push(...DOC_FIELDS);
    }

    const data = pick(req.body, fields);

    const user = await User.create(data);

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      }),
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// Login

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) fail(res, 400, "Email and password are required");

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user || !(await user.matches(password)))
      fail(res, 401, "Incorrect email or password");

    const userData = user.toObject();
    delete userData.password;

    res.json({
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      }),
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// Me

export const me = (req, res) => {
  res.json(req.user);
};

// Update Profile

export const updateProfile = async (req, res, next) => {
  try {
    const fields = ["name", "phone"];

    if (req.user.role === "doctor") {
      fields.push(...DOC_FIELDS);
    }

    const data = pick(req.body, fields);

    Object.assign(req.user, data);

    await req.user.save();

    res.json(req.user);
  } catch (error) {
    next(error);
  }
};
