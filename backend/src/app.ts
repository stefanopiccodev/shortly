import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimiter from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import urlRoutes from "./routes/url.routes";
import authRoutes from "./routes/auth.routes";
import { redirectToOriginal } from "./controllers/url.controller";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);
app.use(errorHandler);

// Routes
app.use("/api/url", urlRoutes);
app.use("/api/auth", authRoutes);
app.use("/:slug", redirectToOriginal);

export default app;
