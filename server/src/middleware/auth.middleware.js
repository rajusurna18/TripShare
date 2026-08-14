import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("NO TOKEN");
    return res.status(401).json({ message: "No token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify the user actually exists in the database
    const user = await User.findById(decoded.id || decoded._id);
    if (!user) {
      console.log("STALE TOKEN: User no longer exists");
      return res.status(401).json({ message: "User not found, session invalid" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};