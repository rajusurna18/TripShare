import {

  createTripService,

  getTripsService,

  joinTripService,

} from "./trip.service.js";

// CREATE TRIP

export const createTrip =
  async (req, res) => {

    try {

      if (req.file) {

        req.body.image =
          req.file.path;

      }

      const trip =
        await createTripService(

          req.body,

          req.user.id

        );

      res.status(201).json(trip);

    } catch (err) {

      res.status(400).json({

        message: err.message,

      });

    }

};

// GET TRIPS

export const getTrips =
  async (req, res) => {

    try {

      const trips =
        await getTripsService();

      res.json(trips);

    } catch (err) {

      res.status(400).json({

        message: err.message,

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

      res.json(trip);

    } catch (err) {

      res.status(400).json({

        message: err.message,

      });

    }

};