import {

  saveMessageService,

  getMessagesService,

} from "./message.service.js";

// SAVE MESSAGE

export const saveMessage =
  async (req, res) => {

    try {

      const message =

        await saveMessageService({

          ...req.body,

          sender:
            req.user.id,

        });

      res.json(message);

    } catch (err) {

      res.status(400).json({

        message:
          err.message,

      });

    }

};

// GET MESSAGES

export const getMessages =
  async (req, res) => {

    try {

      const messages =

        await getMessagesService(

          req.params.tripId

        );

      res.json(messages);

    } catch (err) {

      res.status(400).json({

        message:
          err.message,

      });

    }

};