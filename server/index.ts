import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import roomRouter from "./routes/room";
import { WebSocketServer, WebSocket } from "ws";
import { deleteRoom } from "./db";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/room", roomRouter);

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

type Room = {
  offer: string;
  members: Set<WebSocket>;
};

const rooms = new Map<string, Room>();

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", async (ws) => {
  let memberRoomId: string;

  ws.on("close", async () => {
    rooms.get(memberRoomId)!.members.delete(ws);

    if (rooms.get(memberRoomId)!.members.size === 0) {
      try {
        // delete room when ever leaves it so the idea can be reused later
        rooms.delete(memberRoomId);
        await deleteRoom(memberRoomId);
      } catch (err) {
        console.error(err);
      }
    } else if (rooms.get(memberRoomId)!.members.size === 1) {
      broadcast({ polite: false }, memberRoomId, ws);
    }
  });

  ws.on("message", (data) => {
    const { description, candidate, roomId } = JSON.parse(data.toString());

    if (roomId) {
      memberRoomId = roomId;

      if (rooms.has(memberRoomId)) rooms.get(memberRoomId)!.members.add(ws);
      else rooms.set(memberRoomId, { offer: "", members: new Set([ws]) });

      if (rooms.get(memberRoomId)!.members.size === 1) {
        ws.send(JSON.stringify({ polite: true }));
      } else if (rooms.get(memberRoomId)!.members.size === 2) {
        ws.send(
          JSON.stringify({
            description: rooms.get(memberRoomId!)!.offer,
            polite: true,
          })
        );
      } else {
        ws.close();
      }

      return;
    }

    if (rooms.get(memberRoomId)!.members.size === 1 && description) {
      rooms.get(memberRoomId)!.offer = description;
      return;
    }

    if (description) {
      broadcast({ description }, memberRoomId, ws);
    } else {
      broadcast({ candidate }, memberRoomId, ws);
    }
  });
});

const broadcast = (data: any, roomId: string, sender?: WebSocket) => {
  rooms.get(roomId)!.members.forEach((member) => {
    if (member !== sender) {
      member.send(JSON.stringify(data));
    }
  });
};
