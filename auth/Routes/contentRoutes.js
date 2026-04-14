import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import userAuth from "../service/middleware/userAuth.js";
import adminAuth from "../service/middleware/adminAuth.js";
import hostelModel from "../models/hostelModel.js";
import shortModel from "../models/shortModel.js";
import userModule from "../models/userModule.js";

const contentRoutes = express.Router();

const uploadsRoot = path.resolve("uploads");
const hostelDir = path.join(uploadsRoot, "hostels");
const shortDir = path.join(uploadsRoot, "shorts");
fs.mkdirSync(hostelDir, { recursive: true });
fs.mkdirSync(shortDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "video" || file.fieldname === "video_url") return cb(null, shortDir);
    return cb(null, hostelDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

contentRoutes.get("/hostels", async (_req, res) => {
  try {
    const rows = await hostelModel.find().sort({ createdAt: -1 }).lean();
    const data = rows.map((h) => ({
      id: String(h._id),
      name: h.name,
      video: h.video,
      images: h.images || [],
      location: h.location,
      phone: h.phone,
      price: h.price,
      description: h.description,
    }));
    return res.json({ success: true, data });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "failed to load hostels" });
  }
});

contentRoutes.post(
  "/hostels",
  userAuth,
  adminAuth,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { name, location, phone, price, description } = req.body;
      const videoFile = req.files?.video?.[0];
      if (!name || !location || !phone || !price || !description || !videoFile) {
        return res.status(400).json({ success: false, message: "missing fields" });
      }

      const video = `/uploads/hostels/${videoFile.filename}`;
      const images = (req.files?.images || []).map((img) => `/uploads/hostels/${img.filename}`);

      await hostelModel.create({
        name,
        location,
        phone,
        price,
        description,
        video,
        images,
        createdBy: req.userId,
      });

      return res.json({ success: true });
    } catch (_error) {
      return res.status(500).json({ success: false, message: "failed to create hostel" });
    }
  },
);

contentRoutes.delete("/hostels/:id", userAuth, adminAuth, async (req, res) => {
  try {
    const row = await hostelModel.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "hostel not found" });
    await hostelModel.deleteOne({ _id: req.params.id });
    return res.json({ success: true });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "failed to delete hostel" });
  }
});

contentRoutes.get("/shorts", async (_req, res) => {
  try {
    const rows = await shortModel.find().sort({ createdAt: -1 }).lean();
    const userIds = [...new Set(rows.map((r) => String(r.userId)))];
    const users = await userModule.find({ _id: { $in: userIds } }).select("_id email name").lean();
    const usersById = Object.fromEntries(users.map((u) => [String(u._id), u]));

    const data = rows.map((s) => ({
      id: String(s._id),
      user_id: String(s.userId),
      hostel_id: s.hostelId,
      title: s.title,
      video_url: s.videoUrl,
      price: s.price,
      description: s.description,
      location: s.location,
      created_at: s.createdAt,
      author_name: usersById[String(s.userId)]?.name || "User",
    }));
    return res.json({ success: true, data });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "failed to load shorts" });
  }
});

contentRoutes.post("/shorts", userAuth, upload.single("video"), async (req, res) => {
  try {
    const { title, price, description, location, hostel_id } = req.body;
    if (!req.file || !title || !price || !description || !location) {
      return res.status(400).json({ success: false, message: "missing fields" });
    }

    await shortModel.create({
      userId: req.userId,
      hostelId: hostel_id || null,
      title,
      videoUrl: `/uploads/shorts/${req.file.filename}`,
      price,
      description,
      location,
    });

    return res.json({ success: true });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "failed to create short" });
  }
});

contentRoutes.delete("/shorts/:id", userAuth, async (req, res) => {
  try {
    const short = await shortModel.findById(req.params.id);
    if (!short) return res.status(404).json({ success: false, message: "short not found" });
    const me = await userModule.findById(req.userId).select("role");
    const isOwner = String(short.userId) === String(req.userId);
    const isAdmin = me?.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "forbidden" });
    await shortModel.deleteOne({ _id: req.params.id });
    return res.json({ success: true });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "failed to delete short" });
  }
});

export default contentRoutes;
