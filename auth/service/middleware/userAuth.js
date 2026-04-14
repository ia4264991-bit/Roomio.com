import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ success: false, message: "invalid credentials" });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDecode?.id) {
      return res.status(401).json({ success: false, message: "invalid credentials" });
    }

    req.userId = tokenDecode.id;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "invalid credentials" });
  }
};

export default userAuth;