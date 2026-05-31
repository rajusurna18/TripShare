import multer from "multer";

import path from "path";

// STORAGE

const storage =
  multer.diskStorage({

    destination:

      (req, file, cb) => {

        cb(

          null,

          "uploads/"

        );

      },

    filename:

      (req, file, cb) => {

        cb(

          null,

          Date.now() +

          path.extname(
            file.originalname
          )

        );

      },

  });

// FILE FILTER

const fileFilter =
  (req, file, cb) => {

    cb(null, true);

  };

// UPLOAD

const upload =
  multer({

    storage,

    fileFilter,

  });

export default upload;