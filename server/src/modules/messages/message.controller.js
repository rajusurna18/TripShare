import {
  saveMessageService,
  getMessagesService,
  reactToMessageService,
} from "./message.service.js";
import Trip from "../trip/trip.model.js";
import Message from "./message.model.js";

// SAVE MESSAGE
export const saveMessage = async (req, res) => {
  try {
    const tripId = req.body.trip;
    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: "Trip ID is required",
      });
    }

    const trip = await Trip.findById(tripId);
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

    let fileUrl = "";
    let fileType = "";
    let audioUrl = "";

    // FILE
    if (req.files?.file) {
      fileUrl = `uploads/${req.files.file[0].filename}`;
      fileType = req.files.file[0].mimetype;
    }

    // AUDIO
    if (req.files?.audio) {
      audioUrl = `uploads/${req.files.audio[0].filename}`;
    }

    const message = await saveMessageService({
      ...req.body,
      sender: req.user.id,
      fileUrl,
      fileType,
      audioUrl,
    });

    res.status(201).json({
      success: true,
      message: "Message saved successfully",
      data: message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET MESSAGES
export const getMessages = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const trip = await Trip.findById(tripId);
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

    const messages = await getMessagesService(req.params.tripId);

    res.status(200).json({
      success: true,
      totalMessages: messages.length,
      messages,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// REACT TO MESSAGE (NEW)
export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required",
      });
    }

    const messageToCheck = await Message.findById(messageId);
    if (!messageToCheck) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const trip = await Trip.findById(messageToCheck.trip);
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

    const message = await reactToMessageService(messageId, req.user.id, emoji);

    res.status(200).json({
      success: true,
      message: "Reaction updated successfully",
      data: message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};