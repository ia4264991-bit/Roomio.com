import userModule from "../models/userModule.js";
export const userdata = async (req, res) => {
  try {
    const user = await userModule.findById(req.userId).select("-password -verifyOtp -resetOtp");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "no user found",
      });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        verification: user.isAccountVerify,
      },
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "user not found",
    });
  }
};