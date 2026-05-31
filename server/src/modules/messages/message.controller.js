import {

  saveMessageService,

  getMessagesService,

} from "./message.service.js";

// SAVE MESSAGE

export const saveMessage =
  async (req, res) => {

    try {

      let fileUrl = "";

      let fileType = "";

      let audioUrl = "";

      // FILE

      if (

        req.files?.file

      ) {

        fileUrl =

          `uploads/${req.files.file[0].filename}`;

        fileType =

          req.files.file[0].mimetype;

      }

      // AUDIO

      if (

        req.files?.audio

      ) {

        audioUrl =

          `uploads/${req.files.audio[0].filename}`;

      }

      const message =
        await saveMessageService({

          ...req.body,

          sender:
            req.user.id,

          fileUrl,

          fileType,

          audioUrl,

        });

      res.status(201).json({

        success: true,

        message:
          "Message saved successfully",

        data: message,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

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

      res.status(200).json({

        success: true,

        totalMessages:
          messages.length,

        messages,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};