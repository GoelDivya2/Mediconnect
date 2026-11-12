import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Token

const token = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Error Helpers

export const fail = (res, code, message) => {
  res.status(code);
  throw new Error(message);
};

export const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

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

// Pick

const pick = (o, keys) =>
  Object.fromEntries(
    keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]),
  );

// Register

export const register = wrap(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    fail(res, 400, "Name, email and password are required");

  if (!["doctor", "patient"].includes(role))
    fail(res, 400, "Role must be doctor or patient");

  if (!/^\S+@\S+\.\S+$/.test(email)) fail(res, 400, "Enter a valid email");

  if (password.length < 6)
    fail(res, 400, "Password must be at least 6 characters");

  const data = {
    ...pick(req.body, ["name", "email", "password", "role", "phone"]),
    ...(role === "doctor" ? pick(req.body, DOC_FIELDS) : {}),
  };

  const user = await User.create(data);

  const u = user.toObject();
  delete u.password;

  res.status(201).json({
    token: token(user._id),
    user: u,
  });
});

// Login

export const login = wrap(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) fail(res, 400, "Email and password are required");

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user || !(await user.matches(password)))
    fail(res, 401, "Incorrect email or password");

  const u = user.toObject();
  delete u.password;

  res.json({
    token: token(user._id),
    user: u,
  });
});

// Me

export const me = wrap(async (req, res) => res.json(req.user));

// Update Profile

export const updateProfile = wrap(async (req, res) => {
  Object.assign(
    req.user,
    pick(req.body, [
      "name",
      "phone",
      ...(req.user.role === "doctor" ? DOC_FIELDS : []),
    ]),
  );

  await req.user.save();

  res.json(req.user);
});
