import Message
from "./message.model.js";

// SAVE MESSAGE

export const saveMessageService =
  async (data) => {

    const message =
      await Message.create(data);

    return await Message.findById(
      message._id
    )

      .populate(
        "sender",
        "name profileImage"
      )

      .populate(
        "trip",
        "title destination"
      );

};

// GET TRIP MESSAGES

export const getMessagesService =
  async (tripId) => {

    const messages =
      await Message.find({

        trip: tripId,

      })

        .populate(
          "sender",
          "name profileImage"
        )

        .sort({
          createdAt: 1,
        });

    return messages;

};

// GET RECENT MESSAGES

export const getRecentMessagesService =
  async (tripId) => {

    return await Message.find({

      trip: tripId,

    })

      .populate(
        "sender",
        "name profileImage"
      )

      .sort({
        createdAt: -1,
      })

      .limit(10);

};