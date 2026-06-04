import Friend from "./friend.model.js";
import User from "../auth/auth.model.js";

// ========================
// SEND FRIEND REQUEST
// ========================

export const sendFriendRequestService =
  async (
    sender,
    receiver
  ) => {

    if (
      sender.toString() ===
      receiver.toString()
    ) {

      throw new Error(
        "You cannot send a friend request to yourself"
      );

    }

    const senderUser =
      await User.findById(
        sender
      );

    const receiverUser =
      await User.findById(
        receiver
      );

    if (
      !senderUser ||
      !receiverUser
    ) {

      throw new Error(
        "User not found"
      );

    }

    const existing =
      await Friend.findOne({

        $or: [

          {
            sender,
            receiver,
          },

          {
            sender:
              receiver,

            receiver:
              sender,
          },

        ],

      });

    if (existing) {

      throw new Error(
        "Friend request already exists"
      );

    }

    const request =
      await Friend.create({

        sender,

        receiver,

        status:
          "pending",

      });

    return request;

};

// ========================
// ACCEPT REQUEST
// ========================

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

    if (
      request.status ===
      "accepted"
    ) {

      throw new Error(
        "Already accepted"
      );

    }

    request.status =
      "accepted";

    await request.save();

    // SENDER

    await User.findByIdAndUpdate(

      request.sender,

      {

        $addToSet: {

          friends:
            request.receiver,

          following:
            request.receiver,

        },

      }

    );

    // RECEIVER

    await User.findByIdAndUpdate(

      request.receiver,

      {

        $addToSet: {

          friends:
            request.sender,

          followers:
            request.sender,

        },

      }

    );

    return await Friend.findById(
      requestId
    )

      .populate(
        "sender",
        "name email profileImage"
      )

      .populate(
        "receiver",
        "name email profileImage"
      );

};

// ========================
// REJECT REQUEST
// ========================

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

// ========================
// GET FRIENDS
// ========================

export const getFriendsService =
  async (userId) => {

    return await Friend.find({

      $or: [

        {
          sender:
            userId,
        },

        {
          receiver:
            userId,
        },

      ],

      status:
        "accepted",

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

// ========================
// GET PENDING REQUESTS
// ========================

export const getPendingRequestsService =
  async (userId) => {

    return await Friend.find({

      receiver:
        userId,

      status:
        "pending",

    })

      .populate(
        "sender",
        "name email profileImage"
      )

      .sort({
        createdAt: -1,
      });

};