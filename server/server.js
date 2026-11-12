import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import routes from "./routes/index.js";

import { notFound, errorHandler } from "./middleware/error.js";

// 1. Initialize Express application
const app = express();

// 2. Register global middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

// 3. Register routes
app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

app.use("/api", routes);

// 4. Register error-handling middleware
app.use(notFound);
app.use(errorHandler);

// 5. Connect database and start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
