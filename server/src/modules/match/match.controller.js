import { findMatchesService } from "./match.service.js";

export const getMatches = async (req, res) => {
  try {
    const matches = await findMatchesService(
      req.params.tripId
    );

    res.json(matches);

  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};