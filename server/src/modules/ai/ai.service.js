import genAI from "../../config/gemini.js";
import AIConversation from "./ai.model.js";
import { processTravelCommerceIntent } from "../travelCommerce/travelCommerce.service.js";

// GEMINI MODELS WITH SYSTEM INSTRUCTIONS
const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `You are TripShare AI Buddy, an advanced travel & agentic commerce assistant.
Answer clearly and professionally.
When users specify travel intent with duration, destination, or budget (e.g. 5-day Goa trip for 3 under ₹15,000 each), provide a helpful natural language summary, outline key highlights, and present the structured agentic package option.
Include:
- travel tips & budget suggestions
- hotel & transport recommendations
- clear cost breakdown and remaining safety buffer
Keep formatting clean and readable using Markdown.`,
});

const itineraryModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "You are TripShare AI Planner. You specialize in generating detailed day-wise travel itineraries based on trip details.",
});

const genericToolModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "You are TripShare AI Specialist. Provide expert, highly structured, engaging, and practical travel insights.",
});

// EXPONENTIAL BACKOFF RETRY HELPER
const callGeminiWithRetry = async (fn, retries = 3, delay = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;
      console.log(`Gemini API call failed (attempt ${attempt}/${retries}). Retrying in ${delay}ms... Error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

// HELPER TO DETECT AGENTIC TRAVEL COMMERCE INTENT
const checkAndAttachTravelCommercePackage = async (question, userId, baseResponseText) => {
  const qLower = question.toLowerCase();
  const isCommerceIntent =
    (qLower.includes("goa") || qLower.includes("trip") || qLower.includes("travel") || qLower.includes("plan") || qLower.includes("manali") || qLower.includes("kerala") || qLower.includes("hanoi") || qLower.includes("kyoto")) &&
    (qLower.includes("under") || qLower.includes("budget") || qLower.includes("rs") || qLower.includes("₹") || qLower.includes("per person") || qLower.includes("each") || qLower.includes("people") || qLower.includes("travelers") || qLower.includes("persons"));

  if (!isCommerceIntent) return baseResponseText;

  try {
    const tcResult = await processTravelCommerceIntent(userId, question);
    if (tcResult && tcResult.agenticPackage) {
      const packageTag = `\n\n<!--AGENTIC_COMMERCE_PACKAGE:${JSON.stringify(tcResult.agenticPackage)}-->`;
      return baseResponseText + packageTag;
    }
  } catch (err) {
    console.error("Failed to attach travel commerce package to AI response:", err.message);
  }
  return baseResponseText;
};

// ==============================
// AI CHAT ASSISTANT (PERSISTENT & RETRY-CAPABLE)
// ==============================
export const generateAIReplyService = async (question, userId, conversationId) => {
  let conversation;

  if (conversationId) {
    conversation = await AIConversation.findOne({ _id: conversationId, userId });
  }

  // Auto-create conversation if not found or not provided
  if (!conversation) {
    conversation = await AIConversation.create({
      userId,
      title: question.substring(0, 35) + (question.length > 35 ? "..." : ""),
      messages: [],
    });
  }

  // History Pruning: keep last 14 messages (7 turns) to prevent context window bloat
  const MAX_HISTORY_MESSAGES = 14;
  let messagesToUse = conversation.messages;
  if (messagesToUse.length > MAX_HISTORY_MESSAGES) {
    messagesToUse = messagesToUse.slice(-MAX_HISTORY_MESSAGES);
  }

  // Format existing messages for Gemini SDK startChat
  const sdkHistory = messagesToUse.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // Append user's new question to the db conversation first
  conversation.messages.push({
    role: "user",
    content: question,
    timestamp: new Date(),
  });

  const chat = chatModel.startChat({
    history: sdkHistory,
  });

  // Call Gemini using retry wrapper
  let textResponse = await callGeminiWithRetry(async () => {
    const result = await chat.sendMessage(question);
    return result.response.text();
  });

  // Attach agentic travel commerce package if intent detected
  textResponse = await checkAndAttachTravelCommercePackage(question, userId, textResponse);

  // Append AI's reply to the db conversation
  conversation.messages.push({
    role: "model",
    content: textResponse,
    timestamp: new Date(),
  });

  await conversation.save();

  return {
    reply: textResponse,
    conversation,
  };
};

// ==============================
// AI CHAT ASSISTANT STREAMING SERVICE
// ==============================
export const generateAIReplyServiceStream = async (question, userId, conversationId, onChunk) => {
  let conversation;

  if (conversationId) {
    conversation = await AIConversation.findOne({ _id: conversationId, userId });
  }

  // Auto-create conversation if not found or not provided
  if (!conversation) {
    conversation = await AIConversation.create({
      userId,
      title: question.substring(0, 35) + (question.length > 35 ? "..." : ""),
      messages: [],
    });
  }

  // History Pruning: keep last 14 messages to prevent context window bloat
  const MAX_HISTORY_MESSAGES = 14;
  let messagesToUse = conversation.messages;
  if (messagesToUse.length > MAX_HISTORY_MESSAGES) {
    messagesToUse = messagesToUse.slice(-MAX_HISTORY_MESSAGES);
  }

  // Format existing messages for Gemini SDK startChat
  const sdkHistory = messagesToUse.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // Append user's new question to the db conversation first
  conversation.messages.push({
    role: "user",
    content: question,
    timestamp: new Date(),
  });
  await conversation.save();

  const chat = chatModel.startChat({
    history: sdkHistory,
  });

  let fullResponseText = "";

  // Call Gemini streaming using retry wrapper
  const resultStream = await callGeminiWithRetry(async () => {
    return await chat.sendMessageStream(question);
  });

  for await (const chunk of resultStream.stream) {
    const chunkText = chunk.text();
    fullResponseText += chunkText;
    if (onChunk) {
      onChunk(chunkText);
    }
  }

  // Attach agentic travel commerce package if intent detected
  const finalResponseText = await checkAndAttachTravelCommercePackage(question, userId, fullResponseText);

  // If agentic package was attached, stream the extra package tag to frontend
  if (finalResponseText.length > fullResponseText.length) {
    const extraTag = finalResponseText.substring(fullResponseText.length);
    if (onChunk) {
      onChunk(extraTag);
    }
  }

  // Append AI's reply to the db conversation
  conversation.messages.push({
    role: "model",
    content: finalResponseText,
    timestamp: new Date(),
  });

  await conversation.save();

  return {
    reply: finalResponseText,
    conversation,
  };
};

// ==============================
// AI ITINERARY GENERATOR
// ==============================
export const generateItineraryService = async (data) => {
  const { destination, budget, days, travelers, tripType } = data;

  const prompt = `
Create a detailed and professional ${days || 3}-day travel itinerary.

TRIP DETAILS:
Destination: ${destination}
Budget: ₹${budget || 10000}
Travelers: ${travelers || "2"}
Trip Type: ${tripType || "Leisure"}

INCLUDE:
1. Day-wise travel plan
2. Morning / afternoon / night activities
3. Hotel recommendations
4. Food recommendations
5. Famous tourist places
6. Hidden gems
7. Local transport options
8. Estimated budget breakdown
9. Safety tips
10. Best shopping places
11. Best local experiences

RULES:
- Keep response beautiful
- Use headings
- Use emojis
- Make itinerary realistic
`;

  const textResponse = await callGeminiWithRetry(async () => {
    const result = await itineraryModel.generateContent(prompt);
    return result.response.text();
  });

  return textResponse;
};

// ==============================
// GENERIC AI TOOL GENERATOR (Planner, Destination, Safety, Budget, Trip Assistant)
// ==============================
export const generateGenericAIToolService = async (toolId, query, contextData = {}) => {
  const prompts = {
    planner: `Create a comprehensive travel plan for query: "${query}". Include timeline, key milestones, booking checkpoints, and route recommendations.`,
    destination: `Provide deep destination insights for "${query}". Include climate overview, cultural etiquette, hidden spots, safety score, and top authentic foods.`,
    safety: `Provide real-time safety, medical emergency, local laws, and scam protection advice for destination/query: "${query}".`,
    budget: `Provide a detailed travel budget optimization guide for "${query}". Include money-saving hacks, cost breakdown, transport tips, and cheap eats.`,
    trip_assistant: `You are the real-time trip assistant. Answer this immediate on-trip query: "${query}". Provide quick, practical, actionable instructions.`,
  };

  const prompt = prompts[toolId] || `Provide expert travel assistance for: ${query}`;

  const textResponse = await callGeminiWithRetry(async () => {
    const result = await genericToolModel.generateContent(prompt);
    return result.response.text();
  });

  return textResponse;
};