import {

  sendJoinRequestService,

  getTripRequestsService,

  acceptJoinRequestService,

  rejectJoinRequestService,

} from "./joinRequest.service.js";

import Trip from "../trip/trip.model.js";

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

      const trip = await Trip.findById(req.params.tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: "Trip not found",
        });
      }

      if (trip.createdBy.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized: Only the trip owner can view join requests",
        });
      }

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

          req.params.id,
          req.user.id

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

          req.params.id,
          req.user.id

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