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

// GET SINGLE TRIP
export const getTripById = (id) =>
  API.get(`/trips/${id}`);

// UPDATE TRIP
export const updateTrip = (id, data) =>
  API.put(`/trips/${id}`, data);

// DELETE TRIP
export const deleteTrip = (id) =>
  API.delete(`/trips/${id}`);

// LEAVE TRIP
export const leaveTrip = (id) =>
  API.post(`/trips/${id}/leave`);

// REMOVE MEMBER
export const removeMember = (id, memberId) =>
  API.post(`/trips/${id}/remove-member`, { memberId });

// TRANSFER OWNERSHIP
export const transferOwnership = (id, newOwnerId) =>
  API.post(`/trips/${id}/transfer-ownership`, { newOwnerId });