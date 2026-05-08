
import API from "./api";

export const getMatches = (tripId) =>
  API.get(`/api/match/${tripId}`);