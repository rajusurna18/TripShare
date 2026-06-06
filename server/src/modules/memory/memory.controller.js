import {

  createMemoryService,

  getTripMemoriesService,

  likeMemoryService,

} from "./memory.service.js";

// CREATE

export const createMemory =
  async (req, res) => {

    try {

      if (req.file) {

        req.body.image =
          req.file.path;

      }

      const memory =
        await createMemoryService({

          ...req.body,

          trip:
            req.params.tripId,

          user:
            req.user.id,

        });

      res.status(201).json({

        success: true,

        memory,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// GET MEMORIES

export const getTripMemories =
  async (req, res) => {

    try {

      const memories =
        await getTripMemoriesService(

          req.params.tripId

        );

      res.json({

        success: true,

        memories,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// LIKE

export const likeMemory =
  async (req, res) => {

    try {

      const memory =
        await likeMemoryService(

          req.params.id,

          req.user.id

        );

      res.json({

        success: true,

        memory,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};