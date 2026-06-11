import API from "./api";

// GET MATCHES

export const getMatches = (tripId) =>
  API.get(
    `/match/${tripId}`
  );