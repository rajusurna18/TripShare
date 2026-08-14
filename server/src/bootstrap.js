import dotenv from "dotenv";
dotenv.config();

// Now that environment variables are loaded, start the server
await import("./server.js");
