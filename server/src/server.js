import mongoose from "mongoose";
import app from "./app.js";

const PORT = 5000;

mongoose
  .connect("mongodb://127.0.0.1:27017/TripShare")
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });