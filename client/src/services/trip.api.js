import API from "./api";

// CREATE TRIP

export const createTrip = (data) =>
  API.post(
    "/trips",
    data
  );

// GET TRIPS

export const getTrips = () =>
  API.get("/trips");

// JOIN TRIP

export const joinTrip = (id) =>
  API.post(
    `/trips/${id}/join`
  );