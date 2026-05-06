import User from "./auth.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    ...data,
    password: hashedPassword,
  });

  return user;
};

export const loginUser = async (data) => {
  const user = await User.findOne({ email: data.email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user._id },
    "SECRET_KEY",
    { expiresIn: "7d" }
  );

  return { user, token };
};