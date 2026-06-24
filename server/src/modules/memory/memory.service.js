import Memory from "./memory.model.js";
import User from "../auth/auth.model.js";
import {
  createNotificationService,
} from "../notification/notification.service.js";
import Trip from "../trip/trip.model.js";
import { logActivityService } from "../activity/activity.service.js";

export const createMemoryService =
  async (data) => {

    const memory = await Memory.create(data);

    try {
      const trip = await Trip.findById(data.trip).select("visibility title");
      const visibility = trip?.visibility === "private" ? "MEMBERS_ONLY" : "PUBLIC";

      await logActivityService(
        data.user,
        "MEMORY_UPLOADED",
        memory._id,
        "Memory",
        data.trip,
        {
          caption: memory.caption || "",
          imageUrl: memory.image,
          tripTitle: trip?.title || "",
        },
        visibility
      );
    } catch (err) {
      console.error("Failed to log memory activity:", err.message);
    }

    return memory;

};

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

export const likeMemoryService =
  async (
    memoryId,
    userId
  ) => {

    const memory =
      await Memory.findById(memoryId);

    if (!memory) {
      throw new Error(
        "Memory not found"
      );
    }

    const alreadyLiked =
      memory.likes.some(
        id =>
          id.toString() ===
          userId.toString()
      );

    if (alreadyLiked) {

      memory.likes =
        memory.likes.filter(
          id =>
            id.toString() !==
            userId.toString()
        );

    } else {

      memory.likes.push(userId);

      if (
        memory.user.toString() !==
        userId.toString()
      ) {

        const user =
          await User.findById(userId);

        await createNotificationService(

          memory.user,

          `${user.name} liked your memory ❤️`,

          "memory",

          `/memories/${memory.trip}`,

          userId

        );

      }

    }

    await memory.save();

    return await Memory.findById(
      memoryId
    ).populate(
      "user",
      "name profileImage"
    );

};