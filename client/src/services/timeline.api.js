import API from "./api";

// GET TIMELINE FOR TRIP
export const getTimeline = (tripId) =>
  API.get(`/timeline/${tripId}`);

// SAVE DAY NOTE
export const saveTimelineNote = (tripId, data) =>
  API.post(`/timeline/${tripId}/notes`, data);

// LOG LOCATION CHECKPOINT
export const logTimelineLocation = (tripId, data) =>
  API.post(`/timeline/${tripId}/locations`, data);

// GENERATE AI STORY & SUMMARY
export const generateTimelineAIStory = (tripId) =>
  API.post(`/timeline/${tripId}/ai-story`);

// EDIT EVENT
export const editTimelineEvent = (tripId, eventId, data) =>
  API.put(`/timeline/${tripId}/events/${eventId}`, data);

// DELETE EVENT
export const deleteTimelineEvent = (tripId, eventId) =>
  API.delete(`/timeline/${tripId}/events/${eventId}`);
