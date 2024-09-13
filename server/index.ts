import express, { Express } from "express";
import dotenv from "dotenv";
import roomRouter from "./routes/room";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/room", roomRouter);

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const wss = new WebSocketServer({ server, path: "/ws" });
let offer: any = null;

wss.on("connection", (ws) => {
  if (wss.clients.size === 1) {
    ws.send(JSON.stringify({ polite: false }));
  } else if (wss.clients.size === 2) {
    ws.send(JSON.stringify({ description: offer, polite: true }));
  } else {
    ws.close();
  }

  ws.on("close", () => {});

  ws.on("message", (data) => {
    const { description, candidate } = JSON.parse(data.toString());

    if (wss.clients.size === 1) {
      offer = description;
      return;
    }

    if (description) {
      broadcast({ description }, ws);
    } else {
      broadcast({ candidate }, ws);
    }
  });

  ws.on("close", () => {});
});

const broadcast = (data: any, sender: WebSocket) => {
  wss.clients.forEach((client) => {
    if (client !== sender) {
      client.send(JSON.stringify(data));
    }
  });
};
