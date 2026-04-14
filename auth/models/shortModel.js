import mongoose from "mongoose";

const shortSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    hostelId: { type: String, default: null },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    price: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true },
);

const shortModel = mongoose.models.short || mongoose.model("short", shortSchema);

export default shortModel;
