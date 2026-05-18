import User from "../auth/auth.model.js";

// GET PROFILE

export const getProfileService =
  async (userId) => {

    const user =
      await User.findById(userId)
        .select("-password");

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    return user;

};

// UPDATE PROFILE

export const updateProfileService =
  async (userId, data) => {

    const updatedUser =
      await User.findByIdAndUpdate(

        userId,

        data,

        {
          new: true,
        }

      ).select("-password");

    if (!updatedUser) {

      throw new Error(
        "User not found"
      );

    }

    return updatedUser;

};