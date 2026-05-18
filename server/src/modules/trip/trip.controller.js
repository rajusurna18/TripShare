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

// GET ALL TRIPS

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

// GET SINGLE TRIP

export const getTripById =
  async (req, res) => {

    try {

      const trip =
        await getTripByIdService(
          req.params.id
        );

      res.json(trip);

    } catch (err) {

      res.status(400).json({

        message: err.message,

      });

    }

};