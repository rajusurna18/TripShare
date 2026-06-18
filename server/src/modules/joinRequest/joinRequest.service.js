import JoinRequest from "./joinRequest.model.js";

import Trip from "../trip/trip.model.js";

import User from "../auth/auth.model.js";

import {
  createNotificationService,
} from "../notification/notification.service.js";

// SEND REQUEST

export const sendJoinRequestService =
  async (tripId, userId) => {

    const trip =
      await Trip.findById(tripId);

    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.createdBy.toString() === userId.toString()) {
      throw new Error("You cannot request to join your own trip");
    }

    const alreadyJoined = trip.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );
    if (alreadyJoined) {
      throw new Error("You are already a member of this trip");
    }

    const existing =
      await JoinRequest.findOne({

        trip: tripId,

        user: userId,

      });

    if (existing) {

      throw new Error(
        "Request already exists"
      );

    }

    const request =
      await JoinRequest.create({

        trip: tripId,

        user: userId,

      });

    const user =
      await User.findById(userId);

    if (trip?.createdBy) {

      await createNotificationService(

        trip.createdBy,

        `${user.name} requested to join ${trip.title} ✈️`

      );

    }

    return request;

};

// GET TRIP REQUESTS

export const getTripRequestsService =
  async (tripId) => {

    return await JoinRequest.find({

      trip: tripId,

      status: "pending",

    })

      .populate(
        "user",
        "name email profileImage"
      )

      .sort({
        createdAt: -1,
      });

};

// ACCEPT REQUEST

export const acceptJoinRequestService =
  async (requestId, userId) => {

    const request =
      await JoinRequest.findById(
        requestId
      );

    if (!request) {

      throw new Error(
        "Request not found"
      );

    }

    if (request.status !== "pending") {
      throw new Error(`Request is already ${request.status}`);
    }

    const trip =
      await Trip.findById(
        request.trip
      );

    if (!trip || trip.createdBy.toString() !== userId.toString()) {
      throw new Error(
        "Not authorized to accept requests for this trip"
      );
    }

    request.status =
      "accepted";

    await request.save();

    await Trip.findByIdAndUpdate(

      request.trip,

      {

        $addToSet: {

          members:
            request.user,

        },

      }

    );

    await createNotificationService(

      request.user,

      `Your request to join ${trip.title} was accepted 🎉`

    );

    return request;

};

// REJECT REQUEST

export const rejectJoinRequestService =
  async (requestId, userId) => {

    const request =
      await JoinRequest.findById(
        requestId
      );

    if (!request) {

      throw new Error(
        "Request not found"
      );

    }

    if (request.status !== "pending") {
      throw new Error(`Request is already ${request.status}`);
    }

    const trip =
      await Trip.findById(
        request.trip
      );

    if (!trip || trip.createdBy.toString() !== userId.toString()) {
      throw new Error(
        "Not authorized to reject requests for this trip"
      );
    }

    request.status =
      "rejected";

    await request.save();

    await createNotificationService(

      request.user,

      `Your request to join ${trip.title} was rejected ❌`

    );

    return request;

};