import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {

  console.log(
    "AUTH HEADER:",
    req.headers.authorization
  );

  const authHeader =
    req.headers.authorization;

  if (!authHeader) {

    console.log("NO TOKEN");

    return res.status(401).json({
      message: "No token",
    });

  }

  try {

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log(
      "DECODED:",
      decoded
    );

    req.user = decoded;

    next();

  } catch (error) {

    console.log(
      "JWT ERROR:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid token",
    });

  }

};