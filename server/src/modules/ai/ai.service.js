import genAI
from "../../config/gemini.js";

// ITINERARY AI

export const generateItineraryService =
  async (data) => {

    try {

      const {

        destination,

        budget,

        days,

        travelers,

        travelStyle,

      } = data;

      const prompt = `

Create a detailed ${days}-day travel itinerary for ${destination}
under ₹${budget} for ${travelers} travelers.

Travel Style:
${travelStyle}

Include:
- Day wise plan
- Hotels
- Food
- Attractions
- Transportation
- Budget breakdown

`;

      const model =
        genAI.getGenerativeModel({

          model:
            "gemini-1.5-flash",

        });

      const result =
        await model.generateContent(
          prompt
        );

      const response =
        await result.response;

      return response.text();

    } catch (err) {

      console.log(
        "FULL AI ERROR:"
      );

      console.log(err);

      throw err;

    }

};

// AI CHATBOT

export const chatWithAIService =
  async (question) => {

    try {

      const prompt = `

You are TripShare AI Travel Assistant.

Answer this travel question professionally:

${question}

`;

      const model =
        genAI.getGenerativeModel({

          model:
            "gemini-1.5-flash",

        });

      const result =
        await model.generateContent(
          prompt
        );

      const response =
        await result.response;

      return response.text();

    } catch (err) {

      console.log(err);

      throw err;

    }

};