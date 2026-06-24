import {

  createMemoryService,

  getTripMemoriesService,

  likeMemoryService,

  createCommentService,

  createReplyService,

  getMemoryCommentsService,

  deleteCommentService,

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

// COMMENTS & REPLIES

export const createComment = async (req, res) => {
  try {
    const { id } = req.params; // Memory ID
    const memory = await Memory.findById(id);
    if (!memory) {
      return res.status(404).json({ success: false, message: "Memory not found" });
    }
    const trip = await Trip.findById(memory.trip);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
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

    const comment = await createCommentService(id, req.user.id, req.body.text);
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createReply = async (req, res) => {
  try {
    const { id, commentId } = req.params; // id: Memory ID, commentId: Parent Comment ID
    const memory = await Memory.findById(id);
    if (!memory) {
      return res.status(404).json({ success: false, message: "Memory not found" });
    }
    const trip = await Trip.findById(memory.trip);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
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

    const reply = await createReplyService(id, req.user.id, commentId, req.body.text);
    res.status(201).json({ success: true, reply });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMemoryComments = async (req, res) => {
  try {
    const { id } = req.params; // Memory ID
    const { page, limit } = req.query;
    const memory = await Memory.findById(id);
    if (!memory) {
      return res.status(404).json({ success: false, message: "Memory not found" });
    }
    const trip = await Trip.findById(memory.trip);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
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

    const data = await getMemoryCommentsService(id, page, limit);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { deletedCount } = await deleteCommentService(commentId, req.user.id);
    res.json({ success: true, message: "Comment deleted successfully", deletedCount });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};