import Trip from "./trip.model.js";
import User from "../auth/auth.model.js";
import { sendJoinRequestService } from "../joinRequest/joinRequest.service.js";

import {
  createNotificationService,
} from "../notification/notification.service.js";

import Message from "../messages/message.model.js";
import Memory from "../memory/memory.model.js";
import JoinRequest from "../joinRequest/joinRequest.model.js";
import Expense from "../expense/expense.model.js";
import Settlement from "../expense/settlement.model.js";
import Review from "../review/review.model.js";
import Notification from "../notification/notification.model.js";
import mongoose from "mongoose";

// CREATE TRIP

export const createTripService =
  async (tripData, userId) => {

    const trip =
      await Trip.create({

        ...tripData,

        createdBy:
          userId,

        members: [
          userId,
        ],

        travelStyle:
          tripData.travelStyle ||
          "",

        tags:
          tripData.tags || [],

        maxMembers:
          tripData.maxMembers ||
          10,

        status:
          tripData.status ||
          "upcoming",

      });

    return await Trip.findById(
      trip._id
    )

      .populate(
        "createdBy",
        "name email profileImage"
      )

      .populate(
        "members",
        "name profileImage travelStyle"
      );

};

// GET ALL TRIPS

export const getTripsService =
  async (userId) => {

    return await Trip.find({

      $or: [

        {
          createdBy:
            userId,
        },

        {
          members:
            userId,
        },

      ],

    })

      .populate(
        "createdBy",
        "name email profileImage"
      )

      .populate(
        "members",
        "name profileImage travelStyle"
      )

      .sort({
        createdAt: -1,
      });

};

// JOIN TRIP

export const joinTripService =
  async (tripId, userId) => {

    return await sendJoinRequestService(tripId, userId);

};

// GET SINGLE TRIP

export const getTripByIdService =
  async (tripId) => {

    const trip =
      await Trip.findById(
        tripId
      )

        .populate(
          "createdBy",
          "name profileImage email"
        )

        .populate(
          "members",
          "name profileImage travelStyle personality interests"
        );

    if (!trip) {

      throw new Error(
        "Trip not found"
      );

    }

    const totalMembers =
      trip.members.length;

    const seatsLeft =

      trip.maxMembers -
      totalMembers;

    return {

      ...trip.toObject(),

      totalMembers,

      seatsLeft,

    };

};

// UPDATE TRIP
export const updateTripService = async (tripId, tripData, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  if (trip.createdBy.toString() !== userId) {
    throw new Error("Unauthorized to edit this trip");
  }

  const allowedUpdates = [
    "title",
    "destination",
    "description",
    "budget",
    "startDate",
    "endDate",
    "travelStyle",
    "tags",
    "maxMembers",
    "status",
    "image"
  ];

  allowedUpdates.forEach((key) => {
    if (tripData[key] !== undefined) {
      trip.set(key, tripData[key]);
    }
  });

  if (tripData.startDate) {
    trip.date = new Date(tripData.startDate);
  }

  await trip.save();

  return await Trip.findById(tripId)
    .populate("createdBy", "name email profileImage")
    .populate("members", "name profileImage travelStyle");
};

// DELETE TRIP WITH CASCADE FALLBACK
export const deleteTripService = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  if (trip.createdBy.toString() !== userId) {
    throw new Error("Unauthorized to delete this trip");
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    await Message.deleteMany({ trip: tripId }).session(session);
    await Memory.deleteMany({ trip: tripId }).session(session);
    await JoinRequest.deleteMany({ trip: tripId }).session(session);
    await Expense.deleteMany({ trip: tripId }).session(session);
    await Settlement.deleteMany({ trip: tripId }).session(session);
    await Review.deleteMany({ trip: tripId }).session(session);
    await Notification.deleteMany({ link: { $regex: tripId } }).session(session);
    await Trip.deleteOne({ _id: tripId }).session(session);

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.warn("Mongoose transaction failed, falling back to sequential delete:", error.message);
    await Message.deleteMany({ trip: tripId });
    await Memory.deleteMany({ trip: tripId });
    await JoinRequest.deleteMany({ trip: tripId });
    await Expense.deleteMany({ trip: tripId });
    await Settlement.deleteMany({ trip: tripId });
    await Review.deleteMany({ trip: tripId });
    await Notification.deleteMany({ link: { $regex: tripId } });
    await Trip.deleteOne({ _id: tripId });
  }

  return { success: true };
};

// LEAVE TRIP
export const leaveTripService = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  if (trip.createdBy.toString() === userId) {
    throw new Error("Trip owner cannot leave the trip. Transfer ownership first or delete the trip.");
  }

  const memberIndex = trip.members.findIndex((memberId) => memberId.toString() === userId);
  if (memberIndex === -1) {
    throw new Error("You are not a member of this trip");
  }

  trip.members.splice(memberIndex, 1);
  await trip.save();

  await createNotificationService(
    trip.createdBy,
    `A member has left your trip: ${trip.title}`,
    "trip_leave",
    `/trip/${tripId}`,
    userId
  );

  return await Trip.findById(tripId)
    .populate("createdBy", "name email profileImage")
    .populate("members", "name profileImage travelStyle");
};

// REMOVE MEMBER (OWNER ONLY)
export const removeMemberService = async (tripId, memberId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  if (trip.createdBy.toString() !== userId) {
    throw new Error("Unauthorized: Only the trip owner can remove members");
  }

  if (trip.createdBy.toString() === memberId) {
    throw new Error("You cannot remove yourself (the owner) from the trip");
  }

  const memberIndex = trip.members.findIndex((id) => id.toString() === memberId);
  if (memberIndex === -1) {
    throw new Error("User is not a member of this trip");
  }

  trip.members.splice(memberIndex, 1);
  await trip.save();

  await createNotificationService(
    memberId,
    `You have been removed from the trip: ${trip.title}`,
    "trip_remove",
    "",
    userId
  );

  return await Trip.findById(tripId)
    .populate("createdBy", "name email profileImage")
    .populate("members", "name profileImage travelStyle");
};

// TRANSFER OWNERSHIP (OWNER ONLY)
export const transferOwnershipService = async (tripId, newOwnerId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  if (trip.createdBy.toString() !== userId) {
    throw new Error("Unauthorized: Only the current owner can transfer ownership");
  }

  if (!trip.members.some((id) => id.toString() === newOwnerId)) {
    throw new Error("The new owner must be an active member of this trip");
  }

  if (userId === newOwnerId) {
    throw new Error("You are already the owner of this trip");
  }

  trip.createdBy = newOwnerId;
  await trip.save();

  await createNotificationService(
    newOwnerId,
    `You are now the owner of the trip: ${trip.title}`,
    "trip_ownership_transfer",
    `/trip/${tripId}`,
    userId
  );

  return await Trip.findById(tripId)
    .populate("createdBy", "name email profileImage")
    .populate("members", "name profileImage travelStyle");
};