import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  bio: {
  type: String,
  default: "",
},

profileImage: {
  type: String,
  default: "",
},

interests: [
  {
    type: String,
  }
],
}, { timestamps: true });

export default mongoose.model("User", userSchema);