import {
  generateAIReplyService,
  generateItineraryService,
} from "./ai.service.js";
import AIConversation from "./ai.model.js";

// AI CHAT
export const generateAIReply = async (req, res) => {
  try {
    const { question, conversationId } = req.body;
    const userId = req.user.id;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const { reply, conversation } = await generateAIReplyService(
      question,
      userId,
      conversationId
    );

    res.status(200).json({
      success: true,
      reply,
      conversation,
    });
  } catch (err) {
    console.log("AI CHAT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "AI response failed",
    });
  }
};

// AI ITINERARY
export const generateItinerary = async (req, res) => {
  try {
    const itinerary = await generateItineraryService(req.body);
    res.status(200).json({
      success: true,
      itinerary,
    });
  } catch (err) {
    console.log("AI ITINERARY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "AI itinerary failed",
    });
  }
};

// GET CONVERSATIONS
export const getConversations = async (req, res) => {
  try {
    const conversations = await AIConversation.find({ userId: req.user.id })
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET CONVERSATION
export const getConversation = async (req, res) => {
  try {
    const conversation = await AIConversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    res.status(200).json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE CONVERSATION
export const createConversation = async (req, res) => {
  try {
    const title = req.body.title || "New Chat Session";
    const conversation = await AIConversation.create({
      userId: req.user.id,
      title,
      messages: [],
    });
    res.status(201).json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE CONVERSATION
export const deleteConversation = async (req, res) => {
  try {
    const conversation = await AIConversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    res.status(200).json({ success: true, message: "Conversation deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};