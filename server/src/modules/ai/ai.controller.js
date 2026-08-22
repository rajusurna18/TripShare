import {
  generateAIReplyService,
  generateItineraryService,
  generateAIReplyServiceStream,
  generateGenericAIToolService,
} from "./ai.service.js";
import AIConversation from "./ai.model.js";
import { getFullSubscriptionStatus } from "./aiEntitlement.service.js";
import {
  createOrderService,
  verifyPaymentService,
  handleWebhookService,
} from "./aiPayment.service.js";

// AI CHAT
export const generateAIReply = async (req, res) => {
  try {
    const { question, conversationId, stream } = req.body;
    const userId = req.user.id;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Default to streaming unless explicitly set to false
    if (stream === false) {
      const { reply, conversation } = await generateAIReplyService(
        question,
        userId,
        conversationId
      );

      return res.status(200).json({
        success: true,
        reply,
        conversation,
        entitlement: req.aiEntitlement,
      });
    }

    // Set Server-Sent Events headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const { reply, conversation } = await generateAIReplyServiceStream(
      question,
      userId,
      conversationId,
      (chunkText) => {
        // Send incremental chunk
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    );

    // Send final completed payload
    res.write(`data: ${JSON.stringify({ done: true, conversation, entitlement: req.aiEntitlement })}\n\n`);
    res.end();

  } catch (err) {
    console.log("AI CHAT ERROR:", err);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "AI response failed" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({
        success: false,
        message: "AI response failed",
      });
    }
  }
};

// AI ITINERARY
export const generateItinerary = async (req, res) => {
  try {
    const itinerary = await generateItineraryService(req.body);
    res.status(200).json({
      success: true,
      itinerary,
      entitlement: req.aiEntitlement,
    });
  } catch (err) {
    console.log("AI ITINERARY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "AI itinerary failed",
    });
  }
};

// GENERIC AI TOOL HANDLER (planner, destination, safety, budget, trip_assistant)
export const generateGenericTool = (toolId) => {
  return async (req, res) => {
    try {
      const query = req.body.prompt || req.body.query || req.body.destination || "General guide";
      const resultText = await generateGenericAIToolService(toolId, query, req.body);
      res.status(200).json({
        success: true,
        result: resultText,
        entitlement: req.aiEntitlement,
      });
    } catch (err) {
      console.log(`AI TOOL ERROR (${toolId}):`, err);
      res.status(500).json({
        success: false,
        message: `Failed to generate AI response for ${toolId}`,
      });
    }
  };
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

// SUBSCRIPTION STATUS & USAGE SUMMARY
export const getSubscriptionStatus = async (req, res) => {
  try {
    const status = await getFullSubscriptionStatus(req.user.id);
    res.status(200).json({ success: true, data: status });
  } catch (err) {
    console.error("GET SUBSCRIPTION STATUS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Unable to load subscription details.",
    });
  }
};

// CREATE PAYMENT ORDER
export const createPaymentOrder = async (req, res) => {
  try {
    const { plan, purchasedToolId } = req.body;
    const orderData = await createOrderService(req.user.id, plan, purchasedToolId);
    res.status(200).json({ success: true, data: orderData });
  } catch (err) {
    console.error("CREATE PAYMENT ORDER ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Unable to create payment order.",
    });
  }
};

// VERIFY PAYMENT & ACTIVATE SUBSCRIPTION
export const verifyPayment = async (req, res) => {
  try {
    const result = await verifyPaymentService(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Your subscription could not be activated.",
    });
  }
};

// WEBHOOK HANDLER
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const result = await handleWebhookService(req.body, signature);
    res.status(200).json(result);
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    res.status(400).json({ success: false, message: "Webhook processing failed" });
  }
};