import Trip from "./trip.model.js";
import User from "../auth/auth.model.js";
import { sendJoinRequestService } from "../joinRequest/joinRequest.service.js";

import {
  createNotificationService,
} from "../notification/notification.service.js";

import { logActivityService } from "../activity/activity.service.js";
import Activity from "../activity/activity.model.js";

import Message from "../messages/message.model.js";
import Memory from "../memory/memory.model.js";
import MemoryComment from "../memory/memoryComment.model.js";
import JoinRequest from "../joinRequest/joinRequest.model.js";
import Expense from "../expense/expense.model.js";
import Settlement from "../expense/settlement.model.js";
import Review from "../review/review.model.js";
import Notification from "../notification/notification.model.js";
import mongoose from "mongoose";
import { updateUserStatsCache } from "../profile/profile.service.js";

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

    // Update user stats cache for tripsCreated update
    await updateUserStatsCache(userId);

    // Log Activity
    await logActivityService(
      userId,
      "TRIP_CREATED",
      trip._id,
      "Trip",
      trip._id,
      {
        title: trip.title,
        destination: trip.destination,
        imageUrl: trip.image || "",
        startDate: trip.startDate,
        endDate: trip.endDate
      },
      trip.visibility === "private" ? "MEMBERS_ONLY" : "PUBLIC"
    );

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
  async (userId, options = {}) => {
    const { page, limit, explore } = options;
    const query = explore
      ? {
          createdBy: { $ne: userId },
          members: { $ne: userId },
          archived: { $ne: true },
        }
      : {
          $or: [
            {
              createdBy: userId,
            },
            {
              members: userId,
            },
          ],
        };

    if (page === undefined && limit === undefined) {
      return await Trip.find(query)
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
        })
        .lean();
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    const totalResults = await Trip.countDocuments(query);
    const totalPages = Math.ceil(totalResults / limitNum);

    const trips = await Trip.find(query)
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
      })
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    return {
      trips,
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalResults,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    };
};

// JOIN TRIP

export const joinTripService =
  async (tripId, userId) => {

    return await sendJoinRequestService(tripId, userId);

};

// GET SINGLE TRIP

export const getTripByIdService =
  async (tripId, userId) => {

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

    const pendingRequest = userId
      ? await JoinRequest.findOne({
          trip: tripId,
          user: userId,
          status: "pending",
        })
      : null;

    return {

      ...trip.toObject(),

      totalMembers,

      seatsLeft,

      hasPendingRequest: !!pendingRequest,

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
    const memories = await Memory.find({ trip: tripId }).session(session);
    const memoryIds = memories.map(m => m._id);
    await MemoryComment.deleteMany({ memory: { $in: memoryIds } }).session(session);
    await Memory.deleteMany({ trip: tripId }).session(session);
    await JoinRequest.deleteMany({ trip: tripId }).session(session);
    await Expense.deleteMany({ trip: tripId }).session(session);
    await Settlement.deleteMany({ trip: tripId }).session(session);
    await Review.deleteMany({ trip: tripId }).session(session);
    await Notification.deleteMany({ link: { $regex: tripId } }).session(session);
    await Activity.deleteMany({ $or: [{ entityId: tripId }, { tripId }] }).session(session);
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
    const fallbackMemories = await Memory.find({ trip: tripId });
    const fallbackMemoryIds = fallbackMemories.map(m => m._id);
    await MemoryComment.deleteMany({ memory: { $in: fallbackMemoryIds } });
    await Memory.deleteMany({ trip: tripId });
    await JoinRequest.deleteMany({ trip: tripId });
    await Expense.deleteMany({ trip: tripId });
    await Settlement.deleteMany({ trip: tripId });
    await Review.deleteMany({ trip: tripId });
    await Notification.deleteMany({ link: { $regex: tripId } });
    await Activity.deleteMany({ $or: [{ entityId: tripId }, { tripId }] });
    await Trip.deleteOne({ _id: tripId });
  }

  // Update cached stats for owner and all members
  const membersToUpdate = Array.from(new Set([trip.createdBy, ...(trip.members || [])]));
  await Promise.all(membersToUpdate.map(memberId => updateUserStatsCache(memberId)));

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

  // Update cached stats for the leaving user and trip creator
  await Promise.all([
    updateUserStatsCache(userId),
    updateUserStatsCache(trip.createdBy),
  ]);

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

  // Update cached stats for the removed member
  await updateUserStatsCache(memberId);

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

  await Promise.all([
    updateUserStatsCache(userId),
    updateUserStatsCache(newOwnerId)
  ]);

  return await Trip.findById(tripId)
    .populate("createdBy", "name email profileImage")
    .populate("members", "name profileImage travelStyle");
};

// ARCHIVE TRIP
export const archiveTripService = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }
  if (trip.createdBy.toString() !== userId.toString()) {
    throw new Error("Unauthorized: Only the trip owner can archive it");
  }
  trip.archived = !trip.archived;
  await trip.save();
  return trip;
};

// INVITE MEMBER
export const inviteMemberService = async (tripId, targetUserId, inviterId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }
  const isMember = trip.members.some((id) => id.toString() === targetUserId.toString());
  if (isMember) {
    throw new Error("User is already a member of this trip");
  }

  trip.members.push(targetUserId);
  await trip.save();

  const inviter = await User.findById(inviterId);
  await createNotificationService(
    targetUserId,
    `${inviter.name} added you to the trip "${trip.title}" ✈️`,
    "trip_invite",
    `/trip/${tripId}`,
    inviterId
  );

  // Update target user's stats cache
  await updateUserStatsCache(targetUserId);

  return await Trip.findById(tripId)
    .populate("createdBy", "name email profileImage")
    .populate("members", "name profileImage travelStyle");
};