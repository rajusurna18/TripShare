import http from "http";
import app from "./app.js";
import { initSocket } from "./sockets/index.js";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.OPENAI_API_KEY);

const PORT = 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});