import API from "./api";

export const createTrip = (data, token) =>
  API.post("/api/trips", data, {
    headers: {
      Authorization: token,
    },
  });

export const getTrips = () =>
  API.get("/api/trips");

export const joinTrip = (id, token) =>
  API.post(`/api/trips/${id}/join`, {}, {
    headers: {
      Authorization: token,
    },
  });