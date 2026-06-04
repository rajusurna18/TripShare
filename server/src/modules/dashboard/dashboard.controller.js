import {
  getDashboardStatsService,
} from "./dashboard.service.js";

export const getDashboardStats =
  async (req, res) => {

    try {

      const stats =
        await getDashboardStatsService(
          req.user.id
        );

      res.status(200).json({

        success: true,

        stats,

      });

    } catch (err) {

      console.log(err);

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};
