import openai from "../../config/openai.js";

export const getTripSuggestions = async (req, res) => {

  try {

    const { prompt } = req.body;

    const response =
      await openai.chat.completions.create({

        model: "gpt-3.5-turbo",

        messages: [
          {
            role: "system",
            content:
              "You are a travel assistant for TripShare.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    res.json({
      reply:
        response.choices[0].message.content,
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });
  }
};