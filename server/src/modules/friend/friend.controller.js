import {

  sendFriendRequestService,

  acceptFriendRequestService,

  rejectFriendRequestService,

  getFriendsService,

  getPendingRequestsService,

} from "./friend.service.js";

// SEND REQUEST

export const sendFriendRequest =
  async (req, res) => {

    try {

      const request =
        await sendFriendRequestService(

          req.user.id,

          req.body.receiver

        );

      res.status(201).json({

        success: true,

        message:
          "Friend request sent",

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

// ACCEPT REQUEST

export const acceptFriendRequest =
  async (req, res) => {

    try {

      const request =
        await acceptFriendRequestService(

          req.params.id,
          req.user.id

        );

      res.status(200).json({

        success: true,

        message:
          "Friend request accepted",

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

export const rejectFriendRequest =
  async (req, res) => {

    try {

      const request =
        await rejectFriendRequestService(

          req.params.id,
          req.user.id

        );

      res.status(200).json({

        success: true,

        message:
          "Friend request rejected",

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

// GET FRIENDS

export const getFriends =
  async (req, res) => {

    try {

      const friends =
        await getFriendsService(

          req.user.id

        );

      res.status(200).json({

        success: true,

        totalFriends:
          friends.length,

        friends,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// GET PENDING REQUESTS

export const getPendingRequests =
  async (req, res) => {

    try {

      const requests =
        await getPendingRequestsService(

          req.user.id

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