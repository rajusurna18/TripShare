import Memory
from "./memory.model.js";

// CREATE MEMORY

export const createMemoryService =
  async (data) => {

    return await Memory.create(
      data
    );

};

// GET MEMORIES

export const getTripMemoriesService =
  async (tripId) => {

    return await Memory.find({

      trip: tripId,

    })

      .populate(
        "user",
        "name profileImage"
      )

      .sort({
        createdAt: -1,
      });

};

// LIKE MEMORY

export const likeMemoryService =
  async (
    memoryId,
    userId
  ) => {

    const memory =
      await Memory.findById(
        memoryId
      );

    if (!memory) {

      throw new Error(
        "Memory not found"
      );

    }

    const alreadyLiked =

      memory.likes.includes(
        userId
      );

    if (alreadyLiked) {

      memory.likes =
        memory.likes.filter(
          (id) =>

            id.toString() !==
            userId
        );

    } else {

      memory.likes.push(
        userId
      );

    }

    await memory.save();

    return memory;

};