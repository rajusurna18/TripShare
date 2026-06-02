import {

  generateAIReplyService,

  generateItineraryService,

} from "./ai.service.js";

// AI CHAT

export const generateAIReply =
  async (req, res) => {

    try {

      const reply =
        await generateAIReplyService(

          req.body.question

        );

      res.status(200).json({

        success: true,

        reply,

      });

    } catch (err) {

      console.log(

        "AI CHAT ERROR:",

        err

      );

      res.status(500).json({

        success: false,

        message:
          "AI response failed",

      });

    }

};

// AI ITINERARY

export const generateItinerary =
  async (req, res) => {

    try {

      const itinerary =
        await generateItineraryService(

          req.body

        );

      res.status(200).json({

        success: true,

        itinerary,

      });

    } catch (err) {

      console.log(

        "AI ITINERARY ERROR:",

        err

      );

      res.status(500).json({

        success: false,

        message:
          "AI itinerary failed",

      });

    }

};