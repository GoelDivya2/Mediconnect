import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Constants and Helper Functions

const isDoc = function () {
  return this.role === "doctor";
};

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Clinic Timing Sub-Schema

const timing = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: DAYS,
      required: true,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    start: {
      type: String,
      default: "09:00",
    },
    end: {
      type: String,
      default: "17:00",
    },
  },
  { _id: false },
);

// User Schema

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["doctor", "patient"],
      required: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    // Doctor Details

    specialization: {
      type: String,
      required: isDoc,
    },

    qualification: {
      type: String,
    },

    experience: {
      type: Number,
      min: 0,
    },

    certification: {
      type: String,
    },

    clinicName: {
      type: String,
    },

    clinicAddress: {
      type: String,
    },

    city: {
      type: String,
    },

    locality: {
      type: String,
    },

    state: {
      type: String,
    },

    pincode: {
      type: String,
    },

    consultationFee: {
      type: Number,
      min: 0,
    },

    // Same appointment duration for all working days

    slotDuration: {
      type: Number,
      default: 30,
      min: 5,
      max: 180,
      validate: {
        validator: Number.isInteger,
        message: "Slot duration must be a whole number",
      },
    },

    // Doctor's Clinic Timings

    clinicTimings: {
      type: [timing],
      default: () =>
        DAYS.map((day) => ({
          day,
          isOpen: day !== "Sunday",
          start: "09:00",
          end: "17:00",
        })),
    },
  },
  { timestamps: true },
);

// Password Hashing

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Password Matching

userSchema.methods.matches = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
