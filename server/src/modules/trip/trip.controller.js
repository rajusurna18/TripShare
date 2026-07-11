import {

  createTripService,
  getTripsService,
  joinTripService,
  getTripByIdService,
  updateTripService,
  deleteTripService,
  leaveTripService,
  removeMemberService,
  transferOwnershipService,
  archiveTripService,
  inviteMemberService,

} from "./trip.service.js";

// CREATE TRIP

export const createTrip =
  async (req, res) => {

    try {

      if (req.file) {

        req.body.image =
          req.file.path;

      }

      // TAGS ARRAY

      if (req.body.tags) {

        if (

          !Array.isArray(
            req.body.tags
          )

        ) {

          req.body.tags =

            req.body.tags

              .split(",")

              .map((tag) =>
                tag.trim()
              )

              .filter(Boolean);

        }

      }

      const trip =
        await createTripService(

          req.body,

          req.user.id

        );

      res.status(201).json({

        success: true,

        message:
          "Trip created successfully",

        trip,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// GET ALL TRIPS

export const getTrips =
  async (req, res) => {
    try {
      const { page, limit, explore } = req.query;
      const result =
        await getTripsService(
          req.user.id,
          { page, limit, explore: explore === "true" }
        );

      if (Array.isArray(result)) {
        return res.status(200).json({
          success: true,
          totalTrips:
            result.length,
          trips: result,
        });
      }

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message:
          err.message,
      });
    }
};

// JOIN TRIP

export const joinTrip =
  async (req, res) => {

    try {

      const request =
        await joinTripService(

          req.params.id,
          req.user.id

        );

      res.status(200).json({

        success: true,

        message:
          "Join request sent successfully",

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

// GET SINGLE TRIP

export const getTripById =
  async (req, res) => {

    try {

      const trip =
        await getTripByIdService(
          req.params.id,
          req.user.id
        );

      res.status(200).json({

        success: true,

        trip,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// UPDATE TRIP
export const updateTrip = async (req, res) => {
  try {
    if (req.file) {
      req.body.image = req.file.path;
    }

    if (req.body.tags) {
      if (!Array.isArray(req.body.tags)) {
        req.body.tags = req.body.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    }

    const trip = await updateTripService(req.params.id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE TRIP
export const deleteTrip = async (req, res) => {
  try {
    await deleteTripService(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: "Trip and all associated data deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// LEAVE TRIP
export const leaveTrip = async (req, res) => {
  try {
    const trip = await leaveTripService(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: "Left trip successfully",
      trip,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// REMOVE MEMBER
export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "memberId is required",
      });
    }
    const trip = await removeMemberService(req.params.id, memberId, req.user.id);
    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      trip,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// TRANSFER OWNERSHIP
export const transferOwnership = async (req, res) => {
  try {
    const { newOwnerId } = req.body;
    if (!newOwnerId) {
      return res.status(400).json({
        success: false,
        message: "newOwnerId is required",
      });
    }
    const trip = await transferOwnershipService(req.params.id, newOwnerId, req.user.id);
    res.status(200).json({
      success: true,
      message: "Trip ownership transferred successfully",
      trip,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ARCHIVE TRIP
export const archiveTrip = async (req, res) => {
  try {
    const trip = await archiveTripService(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: trip.archived ? "Trip archived successfully 📦" : "Trip unarchived successfully 📂",
      trip,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// INVITE MEMBER
export const inviteMember = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "targetUserId is required",
      });
    }
    const trip = await inviteMemberService(req.params.id, targetUserId, req.user.id);
    res.status(200).json({
      success: true,
      message: "Teammate added to trip successfully 👥",
      trip,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};