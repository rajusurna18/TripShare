import {

  generateItineraryService,

  chatWithAIService,

} from "./ai.service.js";

// ITINERARY

export const generateItinerary =
  async (req, res) => {

    try {

      const response =
        await generateItineraryService(

          req.body

        );

      res.status(200).json({

        success: true,

        itinerary: response,

      });

    } catch (err) {

      console.log(
        "AI CONTROLLER ERROR:",
        err
      );

      res.status(500).json({

        success: false,

        message:
          err.message ||

          "AI generation failed",

      });

    }

};

// AI CHAT

export const chatWithAI =
  async (req, res) => {

    try {

      const { question } =
        req.body;

      const reply =
        await chatWithAIService(

          question

        );

      res.status(200).json({

        success: true,

        reply,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message:
          "AI chat failed",

      });

    }

};