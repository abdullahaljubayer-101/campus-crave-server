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

// >product create
export async function createProduct(
  session,
  name,
  description,
  price,
  img,
  categorys
) {
  const [vendor] = await pool.query(
    `SELECT *
     FROM vendor
     WHERE user_id = (
        SELECT id
        FROM user
        WHERE session = ?
     )`,
    [session]
  );

  const [product] = await pool.query(
    `INSERT INTO product
    (vendor_id, name, description, price, img, is_available)
    VALUES
    (?, ?, ?, ?, ?, ?)`,
    [vendor[0].id, name, description, price, img, true]
  );

  const [category] = await pool.query(
    `SELECT id
     FROM category
     WHERE name IN (?)`,
    [categorys]
  );

  category.map(async (c) => {
    const [product_to_category] = await pool.query(
      `INSERT INTO product_to_category
      (product_id, category_id)
      VALUES
      (?, ?)`,
      [product.insertId, c.id]
    );
  });

  return true;
}

// get all product
export async function getAllProduct() {
  const [products] = await pool.query(
    `SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
     FROM product AS p
     INNER JOIN vendor AS v
     ON p.vendor_id = v.id
     ORDER BY p.id DESC;`
  );
  return products;
}

// get a product
export async function getProduct(id) {
  const [products] = await pool.query(
    `SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
     FROM product AS p
     INNER JOIN vendor AS v
     ON p.vendor_id = v.id
     WHERE p.id = ?;`,
    [id]
  );
  return products[0];
}

// get search product
export async function getSearchProduct(key) {
  const [products] = await pool.query(
    `SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
     FROM product AS p
     INNER JOIN vendor AS v
     ON p.vendor_id = v.id
     WHERE p.name LIKE '%${key}%'
     ORDER BY p.id DESC;`
  );
  return products;
}

// get category product
export async function getCategoryProduct(category) {
  const [products] = await pool.query(
    `SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
     FROM product AS p
     INNER JOIN vendor AS v
     ON p.vendor_id = v.id
     WHERE p.id IN (
        SELECT product_id
	      FROM product_to_category
	      WHERE category_id = (
    	      SELECT id
		        FROM category
		        WHERE name = ?
        )
     )
     ORDER BY p.id DESC;`,
    [category]
  );
  return products;
}

// get vendor product
export async function getVendorProduct(vendor) {
  const [products] = await pool.query(
    `SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
     FROM product AS p
     INNER JOIN vendor AS v
     ON p.vendor_id = v.id
     WHERE v.name = ?
     ORDER BY p.id DESC;`,
    [vendor]
  );
  return products;
}

// get price product
export async function getPriceProduct(min, max) {
  const [products] = await pool.query(
    `SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
     FROM product AS p
     INNER JOIN vendor AS v
     ON p.vendor_id = v.id
     WHERE p.price BETWEEN ? AND ?
     ORDER BY p.id DESC;`,
    [min, max]
  );
  return products;
}

// get all product vendor
export async function getAllProductVendor(id) {
  const [products] = await pool.query(
    `SELECT *
     FROM product
     WHERE vendor_id = ?
     ORDER BY id DESC`,
    [id]
  );
  return products;
}

// get a product vendor
export async function getProductVendor(id) {
  const [products] = await pool.query(
    `SELECT *
     FROM product
     WHERE id = ?`,
    [id]
  );
  return products[0];
}

// get category
export async function getCategory(id) {
  const [categorys] = await pool.query(
    `SELECT name
       FROM category
       WHERE id IN (
          SELECT category_id 
          FROM product_to_category
          WHERE product_id = ?
       );`,
    [id]
  );
  return categorys;
}

// update available
export async function updateAvailable(id) {
  const [result] = await pool.query(
    `UPDATE product
     SET is_available = NOT is_available
     WHERE id = ?`,
    [id]
  );
  return result;
}

// delete product
export async function deleteProduct(id) {
  try {
    const product_to_category = await pool.query(
      `DELETE
       FROM product_to_category
       WHERE product_id = ?`,
      [id]
    );

    const product = await pool.query(
      `DELETE
       FROM product
       WHERE id = ?`,
      [id]
    );

    return true;
  } catch (e) {
    return false;
  }
}
