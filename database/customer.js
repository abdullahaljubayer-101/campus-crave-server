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

export async function countOrder() {
  const [customer] = await pool.query(
    `SELECT COUNT(orders.id) as count
     FROM orders`
  );
  return customer[0];
}

export async function countCustomer() {
  const [customer] = await pool.query(
    `SELECT COUNT(vendor.id) as count
     FROM vendor;`
  );
  return customer[0];
}

export async function countVendor() {
  const [customer] = await pool.query(
    `SELECT COUNT(customer.id) as count
    FROM customer;`
  );
  return customer[0];
}

// get all customer
export async function getAllCustomer() {
  const [customer] = await pool.query(
    `SELECT u.id AS user_id, u.name, email, phone, u.img AS img, is_email_verified, is_approved, c.id AS id, c.is_loan_available, c.loan_rank
     FROM user AS u
     INNER JOIN customer as c
     ON u.id = c.user_id
     ORDER BY u.id DESC;`
  );
  return customer;
}

// get search customer
export async function getSearchCustomer(key) {
  const [customer] = await pool.query(
    `SELECT u.id AS user_id, u.name, email, phone, u.img AS img, is_email_verified, is_approved, c.id AS id, c.is_loan_available, c.loan_rank
     FROM user AS u
     INNER JOIN customer as c
     ON u.id = c.user_id
     WHERE u.name LIKE '%${key}%'
     ORDER BY u.id DESC;`
  );
  return customer;
}

// get a customer
export async function getCustomer(id) {
  const [customer] = await pool.query(
    `SELECT u.id AS user_id, u.name, email, phone, u.img AS img, is_email_verified, is_approved, c.id AS id, c.is_loan_available, c.loan_rank
     FROM user AS u
     INNER JOIN customer as c
     ON u.id = c.user_id
     WHERE c.id = ?
     ORDER BY u.id DESC;`,
    [id]
  );
  return customer[0];
}

// add to cart
export async function addToCart(session, productID, quantity) {
  const [customer] = await pool.query(
    `SELECT id
     FROM customer
     WHERE user_id = (
	      SELECT id
        FROM user
        WHERE session = ?
     )`,
    [session]
  );

  const result = await pool.query(
    `INSERT INTO cart
    (customer_id, product_id, quantity) 
    VALUES (?, ?, ?)`,
    [customer[0].id, productID, quantity]
  );

  return true;
}

// get to cart
export async function getToCart(session) {
  const [result] = await pool.query(
    `SELECT p.id, p.name, p.price, c.quantity, (p.price * c.quantity) as total, c.customer_id as customer_id
     FROM product AS p
     INNER JOIN cart AS c
     ON p.id = c.product_id
     WHERE c.customer_id = (
	      SELECT id
        FROM customer
        WHERE user_id = (
	          SELECT id
            FROM user
            WHERE session = ?
        )
     );`,
    [session]
  );
  return result;
}

// confirm order
export async function confirmOrder(session) {
  const cart = await getToCart(session);

  cart.map(async (c) => {
    const [vendor] = await pool.query(
      `SELECT vendor_id
       FROM product
       WHERE id = ?;`,
      [c.id]
    );

    const [orders] = await pool.query(
      `INSERT INTO orders
       (customer_id, vendor_id, product_id, quantity)
       VALUES (?, ?, ?, ?);`,
      [c.customer_id, vendor[0].vendor_id, c.id, c.quantity]
    );
  });

  cart.map(async (c) => {
    const [result] = await pool.query(
      `DELETE 
       FROM cart 
       WHERE product_id = ?`,
      [c.id]
    );
  });

  return true;
}

// get order
export async function getOrder() {
  const [result] = await pool.query(
    `SELECT u.id, u.name AS user_name, v.name AS vendor_name, p.name AS product_name, p.price, o.quantity, (p.price * o.quantity) AS total 
     FROM orders AS o
     INNER JOIN customer AS c
     ON o.customer_id = c.id
     INNER JOIN vendor AS v
     ON o.vendor_id = v.id
     INNER JOIN product AS p
     ON o.product_id = p.id
     INNER JOIN user AS u
     ON c.user_id = u.id
     ORDER BY o.id DESC`
  );

  return result;
}

export async function getOrderAAA() {
  const [result] = await pool.query(
    `SELECT u.id, u.name AS user_name, v.name AS vendor_name, p.name AS product_name, p.price, o.quantity, (p.price * o.quantity) AS total 
     FROM orders AS o
     INNER JOIN customer AS c
     ON o.customer_id = c.id
     INNER JOIN vendor AS v
     ON o.vendor_id = v.id
     INNER JOIN product AS p
     ON o.product_id = p.id
     INNER JOIN user AS u
     ON c.user_id = u.id
     ORDER BY o.id DESC`
  );

  return result;
}
