import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  appointmentDate: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
  },

  appointmentTime: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/,
  },

  // Duration at the time of booking

  duration: {
    type: Number,
    min: 5,
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Cancelled"],
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate active appointments at the same start time

appointmentSchema.index(
  {
    doctorId: 1,
    appointmentDate: 1,
    appointmentTime: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["Pending", "Accepted"] },
    },
  },
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
