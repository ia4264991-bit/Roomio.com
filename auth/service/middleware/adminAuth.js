import userModule from "../../models/userModule.js";

const adminAuth = async (req, res, next) => {
  try {
    const user = await userModule.findById(req.userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "admin access required" });
    }
    next();
  } catch (_error) {
    return res.status(403).json({ success: false, message: "admin access required" });
  }
};

export default adminAuth;
