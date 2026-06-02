import genAI
from "../../config/gemini.js";

// GEMINI MODEL

const model =
  genAI.getGenerativeModel({

    model:
      "gemini-1.5-flash",

  });

// ==============================
// AI CHAT ASSISTANT
// ==============================

export const generateAIReplyService =
  async (question) => {

    const prompt = `

You are TripShare AI Buddy,
an advanced travel assistant.

Answer clearly and professionally.

USER QUESTION:
${question}

Include:
- travel tips
- budget suggestions
- hotels
- transport ideas
- food recommendations
- safety tips

Keep formatting clean and readable.

`;

    const result =
      await model.generateContent(
        prompt
      );

    return result
      .response
      .text();

};

// ==============================
// AI ITINERARY GENERATOR
// ==============================

export const generateItineraryService =
  async (data) => {

    const {

      destination,

      budget,

      days,

      travelers,

      tripType,

    } = data;

    const prompt = `

You are TripShare AI Planner.

Create a detailed and professional
${days}-day travel itinerary.

TRIP DETAILS:

Destination:
${destination}

Budget:
₹${budget}

Travelers:
${travelers}

Trip Type:
${tripType}

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

    const result =
      await model.generateContent(
        prompt
      );

    return result
      .response
      .text();

};