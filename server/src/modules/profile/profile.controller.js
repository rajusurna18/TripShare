
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

      // PROFILE IMAGE

      if (req.file) {

        req.body.profileImage =
          req.file.path;

      }

      // HANDLE INTERESTS ARRAY

      if (req.body.interests) {

        if (
          !Array.isArray(
            req.body.interests
          )
        ) {

          req.body.interests = [

            req.body.interests,

          ];

        }

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

