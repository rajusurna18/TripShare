import {
  createTripService,
  getTripsService,
  joinTripService,
} from "./trip.service.js";

export const createTrip = async (req, res) => {
  try {
    const trip = await createTripService(req.body, req.user.id);
    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTrips = async (req, res) => {
  try {
    const trips = await getTripsService();
    res.json(trips);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const joinTrip = async (req, res) => {
  try {
    const trip = await joinTripService(
      req.params.id,
      req.user.id
    );

    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};