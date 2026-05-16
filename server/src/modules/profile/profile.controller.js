import {
  getProfileService,
  updateProfileService,
} from "./profile.service.js";

export const getProfile =
  async (req, res) => {

    try {

      const user =
        await getProfileService(
          req.user.id
        );

      res.json(user);

    } catch (err) {

      res.status(400).json({
        message: err.message,
      });
    }
};

export const updateProfile =
  async (req, res) => {

    try {

      if (req.file) {
        req.body.profileImage =
          req.file.path;
      }

      const user =
        await updateProfileService(
          req.user.id,
          req.body
        );

      res.json(user);

    } catch (err) {

      res.status(400).json({
        message: err.message,
      });
    }
};