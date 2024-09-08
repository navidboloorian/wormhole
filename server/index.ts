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

type Rooms = {
  [roomId: string]: WebSocket[];
};

// track rooms by id
const rooms: Rooms = {};

// link socket instances to rooms
const occupants = new Map<WebSocket, { roomId: string; offer?: any }>();

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === "INIT_CONN") {
      const roomId = message.roomId;

      if (rooms[roomId]) {
        const occupant = rooms[roomId][0];
        const offer = occupants.get(occupant)!.offer;

        ws.send(JSON.stringify(offer));

        rooms[roomId].push(ws);

        console.log("THERE IS SOMEONE IN THE ROOM!");
      } else rooms[roomId] = [ws];

      occupants.set(ws, { roomId: roomId });

      return;
    }

    if (message.type === "OFFER") {
      const offer = message.offer;
      const config = occupants.get(ws)!;

      config.offer = offer;

      occupants.set(ws, config);
    }

    wsBroadcast(data, ws);
  });

  ws.on("close", () => {
    const { roomId } = occupants.get(ws)!;
    const room = rooms[roomId];

    if (room) {
      for (let i = 0; i < room.length; i++) {
        const occupant = room[i];

        if (occupant === ws) {
          room.splice(i, 1);
          break;
        }
      }
    }

    if (room.length === 0) {
      delete rooms[roomId];
    }

    occupants.delete(ws);
  });
});

const wsBroadcast = (data: any, sender: WebSocket) => {
  const { roomId } = occupants.get(sender)!;
  const room = rooms[roomId];

  // for (const occupant of room) {
  //   if (occupant !== sender) {
  //     occupant.send(data);
  //   }
  // }
};
