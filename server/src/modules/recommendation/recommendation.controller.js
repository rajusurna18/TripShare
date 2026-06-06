import {

  getRecommendationsService,

} from "./recommendation.service.js";

export const getRecommendations =
  async (req, res) => {

    try {

      const recommendations =

        await getRecommendationsService(
          req.user.id
        );

      res.status(200).json({

        success: true,

        recommendations,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};