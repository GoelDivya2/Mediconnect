import { Router } from "express";

import { protect, allow } from "../middleware/auth.js";

import * as auth from "../controllers/authController.js";
import * as doc from "../controllers/doctorController.js";
import * as appt from "../controllers/appointmentController.js";

const r = Router();

r.post("/auth/register", auth.register);
r.post("/auth/login", auth.login);
r.get("/auth/me", protect, auth.me);
r.put("/auth/profile", protect, auth.updateProfile);

r.get("/doctors", doc.listDoctors);
r.get("/doctors/:id", doc.getDoctor);
r.get("/doctors/:id/slots", doc.getSlots);

r.post("/appointments", protect, allow("patient"), appt.book);
r.get("/appointments/mine", protect, appt.mine);
r.patch("/appointments/:id/status", protect, appt.setStatus);

export default r;
