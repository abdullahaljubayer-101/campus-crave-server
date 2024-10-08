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

// >get vendor
export async function getVendor(session) {
  const [row] = await pool.query(
    `SELECT *
     FROM vendor
     WHERE user_id = (
	      SELECT id
	      FROM user
	      WHERE session = ?
     );`,
    [session]
  );
  return row[0];
}

// >login
export async function login(email, password) {
  const [row] = await pool.query(
    `SELECT password, role
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
    return { session: session, role: row[0].role };
  } else return false;
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

// >confirm email
export async function confirmEmail(email) {
  const [row] = await pool.query(
    `SELECT *
     FROM user 
     WHERE email = ?`,
    [email]
  );
  if (row.length == 0) return false;
  else {
    const session = uuid4();
    const [result] = await pool.query(
      `UPDATE user
       SET session = ?
       WHERE email = ?`,
      [session, email]
    );
    return session;
  }
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

// >confirm OTP
export async function confirmOTP(otp, session) {
  const [row] = await pool.query(
    `SELECT *
     FROM user
     WHERE otp = ? AND session = ?`,
    [otp, session]
  );
  if (row.length == 1) {
    const [result] = await pool.query(
      `UPDATE user
       SET otp = ?, is_email_verified = ?
       WHERE session = ?`,
      [null, true, session]
    );
    return true;
  } else false;
}

// >reset password
export async function resetPassword(password, session) {
  const hashPassword = await bcrypt.hash(password, 10);
  try {
    const [user] = await pool.query(
      `UPDATE user
       SET password = ?
       WHERE session = ?`,
      [hashPassword, session]
    );
  } catch (e) {
    return false;
  }
  return true;
}

// >change password
export async function changePassword(oldPassword, newPassword, session) {
  const [row] = await pool.query(
    `SELECT password
     FROM user 
     WHERE session = ?`,
    [session]
  );
  const oldHashPassword = row[0].password;
  const isPasswordMatch = await bcrypt.compare(oldPassword, oldHashPassword);

  if (isPasswordMatch) {
    const hashPassword = await bcrypt.hash(newPassword, 10);
    const [user] = await pool.query(
      `UPDATE user
       SET password = ?
       WHERE session = ?`,
      [hashPassword, session]
    );
    return true;
  } else {
    return false;
  }
}

// >update information
export async function updateInformation(name, email, phone, session) {
  try {
    const [user] = await pool.query(
      `UPDATE user
       SET name = ?, email = ?, phone = ?
       WHERE session = ?`,
      [name, email, phone, session]
    );
    return true;
  } catch (e) {
    return false;
  }
}

// >update vendor information
export async function updateVendorInformation(name, description, session) {
  try {
    const [vendor] = await pool.query(
      `UPDATE vendor
       SET name = ?, description = ?
       WHERE user_id = (
	        SELECT id
	        FROM user
	        WHERE session = ?
       );`,
      [name, description, session]
    );
    return true;
  } catch (e) {
    return false;
  }
}

// >customer register
export async function customerRegister(name, email, phone, password) {
  const hashPassword = await bcrypt.hash(password, 10);
  const session = uuid4();
  try {
    const [user] = await pool.query(
      `INSERT INTO user (
          name,
          email,
          phone,
          password,
          role,
          session,
          is_email_verified,
          is_approved
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, hashPassword, "customer", session, false, true]
    );
    const [customer] = await pool.query(
      `INSERT INTO customer (
          user_id,
          is_loan_available,
          loan_rank
       ) VALUES (?, ?, ?)`,
      [user.insertId, false, 0]
    );
    return session;
  } catch (e) {
    return false;
  }
}

// >vendor register
export async function vendorRegister(
  vendorName,
  ownerName,
  email,
  phone,
  password
) {
  const hashPassword = await bcrypt.hash(password, 10);
  const session = uuid4();
  try {
    const [user] = await pool.query(
      `INSERT INTO user (
          name,
          email,
          phone,
          password,
          role,
          session,
          is_email_verified,
          is_approved
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ownerName, email, phone, hashPassword, "vendor", session, false, false]
    );
    const [vendor] = await pool.query(
      `INSERT INTO vendor (
          user_id,
          name
       ) VALUES (?, ?)`,
      [user.insertId, vendorName]
    );
    return session;
  } catch (e) {
    return false;
  }
}

// upload avatar
export async function uploadAvatar(session, img) {
  try {
    const [user] = await pool.query(
      `UPDATE user
       SET img = ?
       WHERE session = ?`,
      [img, session]
    );
    return true;
  } catch (e) {
    return false;
  }
}

// upload vendor avatar
export async function uploadVendorAvatar(session, img) {
  try {
    const [user] = await pool.query(
      `UPDATE vendor
       SET img = ?
       WHERE user_id = (
	        SELECT id
	        FROM user
	        WHERE session = ?
       );`,
      [img, session]
    );
    return true;
  } catch (e) {
    return false;
  }
}
