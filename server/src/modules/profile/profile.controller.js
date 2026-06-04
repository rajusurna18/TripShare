import {
  getProfileService,
  updateProfileService,
  getPublicProfileService,
} from "./profile.service.js";

// GET PROFILE

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

        message:
          err.message,

      });

    }

};

// PUBLIC PROFILE

export const getPublicProfile =
  async (req, res) => {

    try {

      const user =
        await getPublicProfileService(
          req.params.userId
        );

      res.json(user);

    } catch (err) {

      res.status(400).json({

        message:
          err.message,

      });

    }

};

// UPDATE PROFILE

export const updateProfile =
  async (req, res) => {

    try {

      // PROFILE IMAGE

      if (req.file) {

        req.body.profileImage =
          req.file.path;

      }

      // INTERESTS ARRAY

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

      // LANGUAGES ARRAY

      if (req.body.languages) {

        if (

          !Array.isArray(
            req.body.languages
          )

        ) {

          req.body.languages = [

            req.body.languages,

          ];

        }

      }

      // VISITED PLACES ARRAY

      if (req.body.visitedPlaces) {

        if (

          !Array.isArray(
            req.body.visitedPlaces
          )

        ) {

          req.body.visitedPlaces = [

            req.body.visitedPlaces,

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

        message:
          err.message,

      });

    }

};