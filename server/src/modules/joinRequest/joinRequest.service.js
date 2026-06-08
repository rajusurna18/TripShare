import JoinRequest from "./joinRequest.model.js";

import Trip from "../trip/trip.model.js";

import User from "../auth/auth.model.js";

import {
  createNotificationService,
} from "../notification/notification.service.js";

// SEND REQUEST

export const sendJoinRequestService =
  async (tripId, userId) => {

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

    const trip =
      await Trip.findById(tripId);

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
  async (requestId) => {

    const request =
      await JoinRequest.findById(
        requestId
      );

    if (!request) {

      throw new Error(
        "Request not found"
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

    const trip =
      await Trip.findById(
        request.trip
      );

    await createNotificationService(

      request.user,

      `Your request to join ${trip.title} was accepted 🎉`

    );

    return request;

};

// REJECT REQUEST

export const rejectJoinRequestService =
  async (requestId) => {

    const request =
      await JoinRequest.findById(
        requestId
      );

    if (!request) {

      throw new Error(
        "Request not found"
      );

    }

    request.status =
      "rejected";

    await request.save();

    const trip =
      await Trip.findById(
        request.trip
      );

    await createNotificationService(

      request.user,

      `Your request to join ${trip.title} was rejected ❌`

    );

    return request;

};