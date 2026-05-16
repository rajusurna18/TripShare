import User from "../auth/auth.model.js";

export const getProfileService =
  async (userId) => {

    return await User.findById(userId)
      .select("-password");
};

export const updateProfileService =
  async (userId, data) => {

    return await User.findByIdAndUpdate(
      userId,
      data,
      { new: true }
    ).select("-password");
};