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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

wss.on("connection", async (ws) => {
  ws.on("close", () => {
    if (wss.clients.size === 0) {
      offer = "";
    } else if (wss.clients.size === 1) {
      broadcast({ polite: false }, ws);
    }
  });

  ws.on("message", (data) => {
    const { description, candidate } = JSON.parse(data.toString());

    if (wss.clients.size === 1 && description) {
      offer = description;
      return;
    }

    if (description) {
      broadcast({ description }, ws);
    } else {
      broadcast({ candidate }, ws);
    }
  });

  if (wss.clients.size === 1) {
    ws.send(JSON.stringify({ polite: true }));
  } else if (wss.clients.size === 2) {
    ws.send(JSON.stringify({ description: offer, polite: true }));
  } else {
    ws.close();
  }
});

const broadcast = (data: any, sender?: WebSocket) => {
  wss.clients.forEach((client) => {
    if (client !== sender) {
      client.send(JSON.stringify(data));
    }
  });
};
