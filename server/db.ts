import mysql, { ResultSetHeader } from "mysql2/promise";
import dotenv from "dotenv";
import { RowDataPacket } from "mysql2/promise";

dotenv.config();

export type Room = RowDataPacket & {
  identifier: string;
  creatorSDP?: string;
  guestSDP?: string;
};

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  enableKeepAlive: true,
});

export const getRoom = async (
  identifier: string
): Promise<Room | undefined> => {
  const [room] = await pool.query<Room[]>(
    "SELECT * FROM rooms WHERE identifier = ?",
    [identifier]
  );

  return room[0];
};

export const createRoom = async (identifier: string): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO rooms (identifier) VALUES (?)",
    [identifier]
  );

  if (result.affectedRows === 0) return false;
  else return true;
};

export const deleteRoom = async (identifier: string): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM rooms WHERE identifier = ?",
    identifier
  );

  if (result.affectedRows === 0) {
    return false;
  } else {
    return true;
  }
};
