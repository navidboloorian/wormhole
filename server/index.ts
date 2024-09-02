import express, { Express } from "express";
import dotenv from "dotenv";
import roomRouter from "./routes/room";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/room", roomRouter);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
