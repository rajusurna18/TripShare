import User from "../auth/auth.model.js";

// CALCULATE PROFILE COMPLETION

const calculateProfileCompletion =
  (user) => {

    let completedFields = 0;

    const totalFields = 6;

    // PROFILE IMAGE

    if (
      user.profileImage
    ) {

      completedFields++;

    }

    // BIO

    if (
      user.bio &&
      user.bio.trim() !== ""
    ) {

      completedFields++;

    }

    // INTERESTS

    if (
      user.interests &&
      user.interests.length > 0
    ) {

      completedFields++;

    }

    // TRAVEL STYLE

    if (
      user.travelStyle &&
      user.travelStyle.trim() !== ""
    ) {

      completedFields++;

    }

    // PERSONALITY

    if (
      user.personality &&
      user.personality.trim() !== ""
    ) {

      completedFields++;

    }

    // NAME

    if (
      user.name &&
      user.name.trim() !== ""
    ) {

      completedFields++;

    }

    // FINAL %

    return Math.round(

      (completedFields /
        totalFields) * 100

    );

};

// GET PROFILE

export const getProfileService =
  async (userId) => {

    const user =
      await User.findById(userId)
        .select("-password");

    // CHECK USER

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    // PROFILE COMPLETION

    const profileCompletion =
      calculateProfileCompletion(
        user
      );

    return {

      ...user.toObject(),

      profileCompletion,

    };

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

    // CHECK USER

    if (!updatedUser) {

      throw new Error(
        "User not found"
      );

    }

    // PROFILE COMPLETION

    const profileCompletion =
      calculateProfileCompletion(
        updatedUser
      );

    return {

      ...updatedUser.toObject(),

      profileCompletion,

    };

};