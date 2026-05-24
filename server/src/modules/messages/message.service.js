import Message
from "./message.model.js";

// SAVE MESSAGE

export const saveMessageService =
  async (data) => {

    const message =
      await Message.create(data);

    return message;

};

// GET TRIP MESSAGES

export const getMessagesService =
  async (tripId) => {

    return await Message.find({

      trip: tripId,

    })

      .populate(
        "sender",
        "name profileImage"
      )

      .sort({
        createdAt: 1,
      });

};