import express from "express";
import { Request, Response } from "express";
import { createRoom, deleteRoom, getRoom, Room } from "../db";

const router = express.Router();

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const room = await getRoom(id);
  res.status(200).send({ room: room });
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const success = await deleteRoom(id);

  if (success) res.status(200).send({ message: "Success" });
  else res.status(404).send({ message: "Error" });
});

router.post("/", async (req: Request, res: Response) => {
  const { identifier } = req.body;

  const success = await createRoom(identifier);

  if (success) res.status(200).send({ message: "Success" });
  else res.status(404).send({ message: "Error" });
});

export default router;
