import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    video: { type: String, required: true },
    images: [{ type: String }],
    location: { type: String, required: true },
    phone: { type: String, required: true },
    price: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true },
);

const hostelModel = mongoose.models.hostel || mongoose.model("hostel", hostelSchema);

export default hostelModel;
