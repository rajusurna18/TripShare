import Friend
from "./friend.model.js";

// SEND REQUEST

export const sendFriendRequestService =
  async (sender, receiver) => {

    // CHECK EXISTING

    const existing =
      await Friend.findOne({

        sender,

        receiver,

      });

    if (existing) {

      throw new Error(
        "Request already sent"
      );

    }

    return await Friend.create({

      sender,

      receiver,

    });

};

// ACCEPT REQUEST

export const acceptFriendRequestService =
  async (requestId) => {

    const request =
      await Friend.findById(
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

    return request;

};

// REJECT REQUEST

export const rejectFriendRequestService =
  async (requestId) => {

    const request =
      await Friend.findById(
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

    return request;

};

// GET FRIENDS

export const getFriendsService =
  async (userId) => {

    return await Friend.find({

      $or: [

        {
          sender: userId,
        },

        {
          receiver: userId,
        },

      ],

      status: "accepted",

    })

      .populate(
        "sender",
        "name email profileImage"
      )

      .populate(
        "receiver",
        "name email profileImage"
      )

      .sort({
        createdAt: -1,
      });

};

// GET PENDING REQUESTS

export const getPendingRequestsService =
  async (userId) => {

    return await Friend.find({

      receiver: userId,

      status: "pending",

    })

      .populate(
        "sender",
        "name email profileImage"
      )

      .sort({
        createdAt: -1,
      });

};