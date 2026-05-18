import genAI from "../../config/gemini.js";

export const generateItinerary =
  async (req, res) => {

    try {

      const {
        destination,
        budget,
        days,
      } = req.body;

      // PROMPT

      const prompt = `

      Create a detailed ${days}-day
      travel itinerary for ${destination}
      under ₹${budget}.

      Include:

      - Day-wise travel plan
      - Hotels
      - Food suggestions
      - Tourist attractions
      - Transportation
      - Budget breakdown

      `;

      // GEMINI MODEL

      const model =
        genAI.getGenerativeModel({

          model: "gemini-1.5-flash",

        });

      // GENERATE RESPONSE

      const result =
        await model.generateContent(
          prompt
        );

      const response =
        result.response.text();

      // SEND RESPONSE

      res.json({

        itinerary: response,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "AI itinerary generation failed",

      });

    }

  };