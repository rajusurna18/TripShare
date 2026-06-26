import API from "./api";

// SAVE A TRIP
export const saveTrip = (tripId) =>
  API.post(`/saves/${tripId}`);

// UNSAVE A TRIP
export const unsaveTrip = (tripId) =>
  API.delete(`/saves/${tripId}`);

// GET SAVED TRIPS
export const getSavedTrips = (params) =>
  API.get("/saves", { params });

// LOG A SHARE EVENT
export const shareTrip = (tripId, platform) =>
  API.post(`/saves/${tripId}/share`, { platform });

// GET SHARE ANALYTICS
export const getShareAnalytics = () =>
  API.get("/saves/analytics/shares");
