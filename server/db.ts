import mysql, { ResultSetHeader } from "mysql2/promise";
import dotenv from "dotenv";
import { RowDataPacket } from "mysql2/promise";

dotenv.config();

export type Room = RowDataPacket & {
  id: string;
};

export type Response = {
  success?: Room | boolean;
  error?: string[];
};

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  enableKeepAlive: true,
});

export const getRoom = async (id: string): Promise<Response> => {
  try {
    const [room] = await pool.query<Room[]>(
      "SELECT * FROM rooms WHERE id = ?",
      [id]
    );

    if (room.length > 0) {
      return { success: room[0] };
    } else {
      return { error: ["Room does not exist."] };
    }
  } catch (err) {
    console.error(err);
    return { error: ["An unknown error occured."] };
  }
};

export const createRoom = async (id: string): Promise<Response> => {
  try {
    if (id.length < 3) {
      return { error: ["Room code must be between 3-64 characters long."] };
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO rooms (id) VALUES (?)",
      [id]
    );

    if (result.affectedRows === 0) {
      return { error: ["Room could not be created."] };
    } else return { success: true };
  } catch (err: any) {
    console.error(err);

    const errors = [];

    if (err.code) {
      switch (err.code) {
        case "ER_DATA_TOO_LONG":
          errors.push("Room code must be between 3-64 characters long.");
          break;
        case "ER_DUP_ENTRY":
          errors.push("A room with this code already exists.");
          break;
        default:
          errors.push("An unknown error occurred.");
      }
    }

    return { error: errors };
  }
};

export const deleteRoom = async (id: string): Promise<Response> => {
  try {
    await pool.query<ResultSetHeader>("DELETE FROM rooms WHERE id = ?", id);

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: ["An unknown error occurred."] };
  }
};
