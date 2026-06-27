import genAI from "../../config/gemini.js";
import AIConversation from "./ai.model.js";

// GEMINI MODELS WITH SYSTEM INSTRUCTIONS
const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `You are TripShare AI Buddy, an advanced travel assistant.
Answer clearly and professionally.
Include:
- travel tips
- budget suggestions
- hotels
- transport ideas
- food recommendations
- safety tips
Keep formatting clean and readable. Use Markdown headings and bullet points.`,
});

const itineraryModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "You are TripShare AI Planner. You specialize in generating detailed day-wise travel itineraries based on trip details.",
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

  // Format existing messages for Gemini SDK startChat
  const sdkHistory = conversation.messages.map(msg => ({
    role: msg.role,
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
  const textResponse = await callGeminiWithRetry(async () => {
    const result = await chat.sendMessage(question);
    return result.response.text();
  });

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
// AI ITINERARY GENERATOR (RETRY-CAPABLE)
// ==============================
export const generateItineraryService = async (data) => {
  const {
    destination,
    budget,
    days,
    travelers,
    tripType,
  } = data;

  const prompt = `
Create a detailed and professional ${days}-day travel itinerary.

TRIP DETAILS:
Destination: ${destination}
Budget: ₹${budget}
Travelers: ${travelers}
Trip Type: ${tripType}

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
- Budget should match properly
- Avoid very expensive suggestions
- Give smart recommendations
`;

  const textResponse = await callGeminiWithRetry(async () => {
    const result = await itineraryModel.generateContent(prompt);
    return result.response.text();
  });

  return textResponse;
};