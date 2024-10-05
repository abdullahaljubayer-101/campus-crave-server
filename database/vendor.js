import mysql from "mysql2";
import dotenv from "dotenv";
import bcrypt, { compareSync } from "bcrypt";
import uuid4 from "uuid4";

dotenv.config();
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

// get all vendor
export async function getAllVendor() {
  const [row] = await pool.query(
    `SELECT u.id AS user_id, u.name AS username, email, phone, u.img AS user_img, is_email_verified, is_approved, v.id AS vendor_id, v.name AS vendor_name, v.description, v.img AS vendor_img
     FROM user as u
     INNER JOIN vendor as v
     ON u.id = v.user_id;`
  );
  return row;
}

// get vendor
export async function getVendor(id) {
  const [row] = await pool.query(
    `SELECT u.id AS user_id, u.name AS username, email, phone, u.img AS user_img, is_email_verified, is_approved, v.id AS vendor_id, v.name AS vendor_name, v.description, v.img AS vendor_img
     FROM user as u
     INNER JOIN vendor as v
     ON u.id = v.user_id
     WHERE u.id = ?;`,
    [id]
  );
  return row[0];
}

// approved vendor
export async function approvedVendor(id) {
  const result = await pool.query(
    `UPDATE user
     SET is_approved = ?
     WHERE id = ?;`,
    [true, id]
  );
  return true;
}
