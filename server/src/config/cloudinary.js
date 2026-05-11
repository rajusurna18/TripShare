import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({

  cloud_name: "dyp4rhbog",

  api_key: "132671511539121",

  api_secret: "**********",

});

export default cloudinary;