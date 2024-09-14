import express from "express";
import { Request, Response } from "express";
import { createRoom, deleteRoom, getRoom, Room } from "../db";

const router = express.Router();

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const resp = await getRoom(id);
  res.status(200).send(resp);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const success = await deleteRoom(id);

  if (success) res.status(200).send({ message: "Success" });
  else res.status(404).send({ message: "Error" });
});

router.post("/", async (req: Request, res: Response) => {
  const { id } = req.body;

  const resp = await createRoom(id);
  res.status(200).send(resp);
});

export default router;
