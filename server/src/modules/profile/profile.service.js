import User from "../auth/auth.model.js";

// PROFILE COMPLETION

const calculateProfileCompletion =
  (user) => {

    let completedFields = 0;

    const totalFields = 11;

    if (user.profileImage)
      completedFields++;

    if (
      user.bio &&
      user.bio.trim() !== ""
    )
      completedFields++;

    if (
      user.interests &&
      user.interests.length > 0
    )
      completedFields++;

    if (
      user.travelStyle &&
      user.travelStyle.trim() !== ""
    )
      completedFields++;

    if (
      user.personality &&
      user.personality.trim() !== ""
    )
      completedFields++;

    if (
      user.location &&
      user.location.trim() !== ""
    )
      completedFields++;

    if (
      user.languages &&
      user.languages.length > 0
    )
      completedFields++;

    if (
      user.visitedPlaces &&
      user.visitedPlaces.length > 0
    )
      completedFields++;

    if (
      user.instagram &&
      user.instagram.trim() !== ""
    )
      completedFields++;

    if (
      user.website &&
      user.website.trim() !== ""
    )
      completedFields++;

    if (
      user.name &&
      user.name.trim() !== ""
    )
      completedFields++;

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

        .select("-password")

        .populate(
          "friends",
          "name profileImage"
        )

        .populate(
          "followers",
          "name profileImage"
        )

        .populate(
          "following",
          "name profileImage"
        );

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

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

      )

        .select("-password")

        .populate(
          "friends",
          "name profileImage"
        )

        .populate(
          "followers",
          "name profileImage"
        )

        .populate(
          "following",
          "name profileImage"
        );

    if (!updatedUser) {

      throw new Error(
        "User not found"
      );

    }

    const profileCompletion =
      calculateProfileCompletion(
        updatedUser
      );

    return {

      ...updatedUser.toObject(),

      profileCompletion,

    };

};

// PUBLIC PROFILE

export const getPublicProfileService =
  async (userId) => {

    const user =
      await User.findById(userId)

        .select("-password")

        .populate(
          "friends",
          "name profileImage"
        )

        .populate(
          "followers",
          "name profileImage"
        )

        .populate(
          "following",
          "name profileImage"
        );

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    const profileCompletion =
      calculateProfileCompletion(
        user
      );

    return {

      ...user.toObject(),

      profileCompletion,

    };

};