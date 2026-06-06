import {

  createTripService,
  getTripsService,
  joinTripService,
  getTripByIdService,

} from "./trip.service.js";

// CREATE TRIP

export const createTrip =
  async (req, res) => {

    try {

      if (req.file) {

        req.body.image =
          req.file.path;

      }

      // TAGS ARRAY

      if (req.body.tags) {

        if (

          !Array.isArray(
            req.body.tags
          )

        ) {

          req.body.tags =

            req.body.tags

              .split(",")

              .map((tag) =>
                tag.trim()
              )

              .filter(Boolean);

        }

      }

      const trip =
        await createTripService(

          req.body,

          req.user.id

        );

      res.status(201).json({

        success: true,

        message:
          "Trip created successfully",

        trip,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// GET ALL TRIPS

export const getTrips =
  async (req, res) => {

    try {

      const trips =
        await getTripsService(
          req.user.id
        );

      res.status(200).json({

        success: true,

        totalTrips:
          trips.length,

        trips,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// JOIN TRIP

export const joinTrip =
  async (req, res) => {

    try {

      const trip =
        await joinTripService(

          req.params.id,
          req.user.id

        );

      res.status(200).json({

        success: true,

        message:
          "Joined trip successfully",

        trip,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// GET SINGLE TRIP

export const getTripById =
  async (req, res) => {

    try {

      const trip =
        await getTripByIdService(
          req.params.id
        );

      res.status(200).json({

        success: true,

        trip,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};