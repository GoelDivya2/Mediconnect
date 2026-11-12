import Appointment from "../models/Appointment.js";
import User, { DAYS } from "../models/User.js";
import { wrap, fail } from "./authController.js";

// Helper Functions

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Book Appointment

export const book = wrap(async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime } = req.body;

  if (!doctorId || !appointmentDate || !appointmentTime) {
    return fail(res, 400, "Doctor, date and time are required");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
    return fail(res, 400, "Invalid appointment date");
  }

  const parsedDate = new Date(appointmentDate + "T00:00:00");

  if (ymd(parsedDate) !== appointmentDate) {
    return fail(res, 400, "Invalid appointment date");
  }

  if (!/^\d{2}:\d{2}$/.test(appointmentTime)) {
    return fail(res, 400, "Invalid appointment time");
  }

  const appointmentMinutes = toMin(appointmentTime);

  if (appointmentMinutes < 0 || appointmentMinutes >= 1440) {
    return fail(res, 400, "Invalid appointment time");
  }

  if (appointmentDate < ymd(new Date())) {
    return fail(res, 400, "Cannot book a past date");
  }

  const doc = await User.findOne({
    _id: doctorId,
    role: "doctor",
  });

  if (!doc) return fail(res, 404, "Doctor not found");

  const day = DAYS[parsedDate.getDay()];

  const t = doc.clinicTimings.find((x) => x.day === day);

  if (!t?.isOpen) {
    return fail(res, 400, "Clinic is closed on that day");
  }

  const duration = doc.slotDuration || 30;

  const start = toMin(t.start);
  const end = toMin(t.end);

  // Clinic Boundaries

  if (appointmentMinutes < start || appointmentMinutes + duration > end) {
    return fail(res, 400, "Appointment is outside clinic timings");
  }

  // Slot Alignment

  if ((appointmentMinutes - start) % duration !== 0) {
    return fail(res, 400, "Invalid appointment slot");
  }

  // Past Time

  const now = new Date();

  if (
    appointmentDate === ymd(now) &&
    appointmentMinutes <= now.getHours() * 60 + now.getMinutes()
  ) {
    return fail(res, 400, "Cannot book a past time");
  }

  // Existing Active Appointments

  const existing = await Appointment.find({
    doctorId,
    appointmentDate,
    status: { $in: ["Pending", "Accepted"] },
  });

  // Overlap Check

  const requestedEnd = appointmentMinutes + duration;

  const overlap = existing.some((a) => {
    const existingStart = toMin(a.appointmentTime);
    const existingEnd = existingStart + (a.duration || duration);

    return appointmentMinutes < existingEnd && requestedEnd > existingStart;
  });

  if (overlap) {
    return fail(res, 409, "That time slot is already booked");
  }

  // Create Appointment

  try {
    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user._id,
      appointmentDate,
      appointmentTime,
      duration,
    });

    res.status(201).json(appointment);
  } catch (error) {
    if (error.code === 11000) {
      return fail(res, 409, "That time slot is already booked");
    }

    throw error;
  }
});

// Get My Appointments

export const mine = wrap(async (req, res) => {
  const isDoc = req.user.role === "doctor";

  res.json(
    await Appointment.find(
      isDoc ? { doctorId: req.user._id } : { patientId: req.user._id },
    )
      .populate(
        "doctorId",
        "name specialization clinicName clinicAddress city locality consultationFee",
      )
      .populate("patientId", "name phone email")
      .sort({ appointmentDate: 1, appointmentTime: 1 }),
  );
});

// Update Appointment Status

export const setStatus = wrap(async (req, res) => {
  const { status } = req.body;

  const a = await Appointment.findById(req.params.id);

  if (!a) return fail(res, 404, "Appointment not found");

  if (req.user.role === "doctor") {
    if (String(a.doctorId) !== String(req.user._id)) {
      return fail(res, 403, "Not your appointment");
    }

    if (!["Accepted", "Rejected"].includes(status)) {
      return fail(res, 400, "Use Accepted or Rejected");
    }

    if (a.status !== "Pending") {
      return fail(res, 400, "Only pending requests can be updated");
    }
  } else {
    if (String(a.patientId) !== String(req.user._id)) {
      return fail(res, 403, "Not your appointment");
    }

    if (status !== "Cancelled") {
      return fail(res, 400, "Patients can only cancel");
    }

    if (!["Pending", "Accepted"].includes(a.status)) {
      return fail(res, 400, "This appointment cannot be cancelled");
    }
  }

  a.status = status;

  await a.save();

  res.json(a);
});
