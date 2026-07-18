import API from "./api";

// GET MATCHES

export const getMatches = (tripId, page = 1, limit = 12) =>
  API.get(
    `/match/${tripId}?page=${page}&limit=${limit}`
  );