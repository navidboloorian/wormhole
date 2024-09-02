import express from "express";
import { Request, Response } from "express";
import { createRoom, deleteRoom, getRoom, Room } from "../db";

const router = express.Router();

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const room = await getRoom(id);
  res.send({ status: 200, room: room });
});

router.post("/", async (req: Request, res: Response) => {
  const { identifier } = req.body;

  const success = await createRoom(identifier);

  if (success) res.send({ status: 200 });
  else res.send({ status: 404 });
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const success = await deleteRoom(id);

  if (success) res.send({ status: 200 });
  else res.send({ status: 404 });
});

export default router;
