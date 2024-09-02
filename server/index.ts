import express, { Express } from "express";
import dotenv from "dotenv";

dotenv.config();

export const app: Express = express();
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));
