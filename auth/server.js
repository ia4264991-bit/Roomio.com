import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./service/mongodb.js";
import authRoutes from "./Routes/authRoutes.js";
import router from "./Routes/newRoute.js";
import contentRoutes from "./Routes/contentRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cookieParser());
const configuredOrigins = String(process.env.CLIENT_URL || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true);
      if (configuredOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (_req, res) => {
  res.send("api working");
});

app.use("/api/auth", authRoutes);
app.use("/api/data", router);
app.use("/api/content", contentRoutes);

app.listen(port, () => console.log(`server listening on port ${port}`));