import mysql from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
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

// >login
export async function login(email, password) {
  const [row] = await pool.query(
    `SELECT password 
     FROM user 
     WHERE email = ?`,
    [email]
  );
  if (row.length == 0) return false;

  const hashPassword = row[0].password;
  const isPasswordMatch = await bcrypt.compare(password, hashPassword);
  if (isPasswordMatch) {
    const session = uuid4();
    const [result] = await pool.query(
      `UPDATE user
       SET session = ?
       WHERE email = ?`,
      [session, email]
    );
    return session;
  } else return false;
}

// >get user
export async function getUser(session) {
  const [row] = await pool.query(
    `SELECT * 
     FROM user 
     WHERE session = ?`,
    [session]
  );
  return row[0];
}

// >logout
export async function logout(session) {
  const [result] = await pool.query(
    `UPDATE user
     SET session = ?
     WHERE session = ?`,
    [null, session]
  );
}

// >set OTP
export async function setOTP(otp, session) {
  const [result] = await pool.query(
    `UPDATE user
     SET otp = ?
     WHERE session = ?`,
    [otp, session]
  );
}

// >customer register
export async function customerRegister(name, email, phone, password) {
  const hashPassword = await bcrypt.hash(password, 10);
  const [user] = await pool.query(
    `INSERT INTO user (
	      name,
        email,
        phone,
        password,
        role,
        is_email_verified,
        is_approved
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, hashPassword, "customer", false, true]
  );
  const [customer] = await pool.query(
    `INSERT INTO customer (
	      user_id,
        is_loan_available,
        loan_rank
     ) VALUES (?, ?, ?)`,
    [user.insertId, false, 0]
  );
  return true;
}

// export async function getAllUser() {
//   const [rows] = await pool.query("SELECT * FROM user");
//   return rows;
// }

// export async function getUser(id) {
//   const [rows] = await pool.query(
//     `
//   SELECT *
//   FROM user
//   WHERE id = ?
//   `,
//     [id]
//   );
//   return rows[0];
// }

// export async function createUser(name, email, phone, password) {
//   const [result] = await pool.query(
//     `
//   INSERT INTO user (name, email, phone, password)
//   VALUES (?, ?, ?, ?)
//   `,
//     [name, email, phone, password]
//   );
//   const id = result.insertId;
//   return getUser(id);
// }
