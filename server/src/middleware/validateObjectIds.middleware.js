import mongoose from "mongoose";

export const validateObjectIds = (req, res, next) => {
  for (const key in req.params) {
    if (key.toLowerCase().includes("id")) {
      const val = req.params[key];
      if (val && !mongoose.Types.ObjectId.isValid(val)) {
        return res.status(400).json({
          success: false,
          message: `Invalid identifier format: ${key}`,
        });
      }
    }
  }
  next();
};
