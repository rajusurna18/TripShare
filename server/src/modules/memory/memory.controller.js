import {

  createMemoryService,

  getTripMemoriesService,

  likeMemoryService,

} from "./memory.service.js";

import Trip from "../trip/trip.model.js";
import Memory from "./memory.model.js";

// CREATE

export const createMemory =
  async (req, res) => {

    try {

      const trip = await Trip.findById(req.params.tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: "Trip not found",
        });
      }

      const isCreator = trip.createdBy.toString() === req.user.id.toString();
      const isMember = trip.members.some(
        (member) => member.toString() === req.user.id.toString()
      );

      if (!isCreator && !isMember) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not a member of this trip",
        });
      }

      if (req.file) {

        req.body.image =
          req.file.path;

      }

      const memory =
        await createMemoryService({

          ...req.body,

          trip:
            req.params.tripId,

          user:
            req.user.id,

        });

      res.status(201).json({

        success: true,

        memory,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// GET MEMORIES

export const getTripMemories =
  async (req, res) => {

    try {

      const trip = await Trip.findById(req.params.tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: "Trip not found",
        });
      }

      const isCreator = trip.createdBy.toString() === req.user.id.toString();
      const isMember = trip.members.some(
        (member) => member.toString() === req.user.id.toString()
      );

      if (!isCreator && !isMember) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not a member of this trip",
        });
      }

      const memories =
        await getTripMemoriesService(

          req.params.tripId

        );

      res.json({

        success: true,

        memories,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// LIKE

export const likeMemory =
  async (req, res) => {

    try {

      const memoryDoc = await Memory.findById(req.params.id);
      if (!memoryDoc) {
        return res.status(404).json({
          success: false,
          message: "Memory not found",
        });
      }

      const trip = await Trip.findById(memoryDoc.trip);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: "Trip associated with memory not found",
        });
      }

      const isCreator = trip.createdBy.toString() === req.user.id.toString();
      const isMember = trip.members.some(
        (member) => member.toString() === req.user.id.toString()
      );

      if (!isCreator && !isMember) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not a member of this trip",
        });
      }

      const memory =
        await likeMemoryService(

          req.params.id,

          req.user.id

        );

      res.json({

        success: true,

        memory,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};