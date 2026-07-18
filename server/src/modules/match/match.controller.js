import { findMatchesService } from "./match.service.js";

export const getMatches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await findMatchesService(
      req.params.tripId,
      req.user.id,
      page,
      limit
    );

    res.json(result);

  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};