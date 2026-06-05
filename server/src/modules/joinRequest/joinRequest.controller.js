import {

  sendJoinRequestService,

  getTripRequestsService,

  acceptJoinRequestService,

  rejectJoinRequestService,

} from "./joinRequest.service.js";

// SEND REQUEST

export const sendJoinRequest =
  async (req, res) => {

    try {

      const request =
        await sendJoinRequestService(

          req.params.tripId,

          req.user.id

        );

      res.status(201).json({

        success: true,

        message:
          "Join request sent",

        request,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// GET REQUESTS

export const getTripRequests =
  async (req, res) => {

    try {

      const requests =
        await getTripRequestsService(

          req.params.tripId

        );

      res.status(200).json({

        success: true,

        totalRequests:
          requests.length,

        requests,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// ACCEPT REQUEST

export const acceptJoinRequest =
  async (req, res) => {

    try {

      const request =
        await acceptJoinRequestService(

          req.params.id

        );

      res.status(200).json({

        success: true,

        message:
          "Request accepted",

        request,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// REJECT REQUEST

export const rejectJoinRequest =
  async (req, res) => {

    try {

      const request =
        await rejectJoinRequestService(

          req.params.id

        );

      res.status(200).json({

        success: true,

        message:
          "Request rejected",

        request,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};