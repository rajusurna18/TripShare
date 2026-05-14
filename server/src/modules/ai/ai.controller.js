import openai from "../../config/openai.js";

export const generateItinerary =
  async (req, res) => {

    try {

      const {
        destination,
        budget,
        days,
      } = req.body;

      const prompt = `
      Create a detailed ${days}-day
      travel itinerary for ${destination}
      under ₹${budget}.

      Include:
      - Day-wise plan
      - Hotels
      - Food suggestions
      - Tourist attractions
      - Transportation
      - Budget breakdown
      `;

      const response =
        await openai.chat.completions.create({

          model: "gpt-3.5-turbo",

          messages: [
            {
              role: "system",
              content:
                "You are an expert travel planner.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

      res.json({
        itinerary:
          response.choices[0]
          .message.content,
      });

    } catch (err) {

      res.status(500).json({
        message: err.message,
      });
    }
};