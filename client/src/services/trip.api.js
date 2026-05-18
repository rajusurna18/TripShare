import API from "./api";

// CREATE TRIP

export const createTrip = (data) =>
  API.post(
    "/api/trips",
    data
  );

// GET TRIPS

export const getTrips = () =>
  API.get("/api/trips");

// JOIN TRIP

export const joinTrip = (id) =>
  API.post(
    `/api/trips/${id}/join`
  );