import User, { DAYS } from "../models/User.js";
import Appointment from "../models/Appointment.js";
import { wrap, fail } from "./authController.js";

// Escape Special Characters

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// List Doctors

export const listDoctors = wrap(async (req, res) => {
  const { name, specialization, city, locality, pincode } = req.query;

  const f = { role: "doctor" };

  if (name) f.name = new RegExp(esc(name.trim()), "i");

  if (specialization)
    f.specialization = new RegExp(`^${esc(specialization.trim())}$`, "i");

  if (city) f.city = new RegExp(esc(city.trim()), "i");

  if (locality) f.locality = new RegExp(esc(locality.trim()), "i");

  if (pincode) f.pincode = pincode.trim();

  const doctors = await User.find(f).sort({ experience: -1 });

  res.json(doctors);
});

// Get Doctor

export const getDoctor = wrap(async (req, res) => {
  const d = await User.findOne({
    _id: req.params.id,
    role: "doctor",
  });

  if (!d) {
    fail(res, 404, "Doctor not found");
  }

  res.json(d);
});

// Time Helpers

const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const fmt = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Get Available Slots

export const getSlots = wrap(async (req, res) => {
  const { date } = req.query;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    fail(res, 400, "Date must be YYYY-MM-DD");
  }

  const selectedDate = new Date(date + "T00:00:00");

  if (ymd(selectedDate) !== date) {
    fail(res, 400, "Invalid date");
  }

  const d = await User.findOne({
    _id: req.params.id,
    role: "doctor",
  });

  if (!d) {
    fail(res, 404, "Doctor not found");
  }

  const day = DAYS[selectedDate.getDay()];

  const t = d.clinicTimings.find((x) => x.day === day);

  if (!t?.isOpen) {
    return res.json({
      open: false,
      slots: [],
    });
  }

  const appointments = await Appointment.find({
    doctorId: d._id,
    appointmentDate: date,
    status: { $in: ["Pending", "Accepted"] },
  });

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slots = [];

  const duration = d.slotDuration || 30;

  // Generate Slots and Check Overlaps

  for (let m = toMin(t.start); m + duration <= toMin(t.end); m += duration) {
    const slotEnd = m + duration;

    const isTaken = appointments.some((a) => {
      const existingStart = toMin(a.appointmentTime);
      const existingEnd = existingStart + (a.duration || duration);

      return m < existingEnd && slotEnd > existingStart;
    });

    slots.push({
      time: fmt(m),
      available: !isTaken && !(date === ymd(now) && m <= nowMin),
    });
  }

  res.json({
    open: true,
    start: t.start,
    end: t.end,
    slotDuration: duration,
    slots,
  });
});
