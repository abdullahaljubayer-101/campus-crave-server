-------------------- query --------------------
SELECT * 
FROM user 
WHERE session = ?;


SELECT password, role
FROM user 
WHERE email = ?;


SELECT id
FROM category
WHERE name IN (?);


-------------------- insert --------------------
INSERT INTO user ( name, email, phone, password, role, session, is_email_verified, is_approved) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?);


INSERT INTO customer (
    user_id,
    is_loan_available,
    loan_rank
) VALUES (?, ?, ?);


INSERT INTO vendor (
    user_id,
    name
) VALUES (?, ?);


INSERT INTO cart
(customer_id, product_id, quantity) 
VALUES (?, ?, ?);


INSERT INTO orders
(customer_id, vendor_id, product_id, quantity)
VALUES (?, ?, ?, ?);


-------------------- update --------------------
UPDATE user
SET session = ?
WHERE email = ?;


UPDATE user
SET img = ?
WHERE session = ?;


UPDATE user
SET password = ?
WHERE session = ?;


UPDATE user
SET name = ?, email = ?, phone = ?
WHERE session = ?;


DELETE
FROM product_to_category
WHERE product_id = ?


-------------------- delete --------------------
DELETE 
FROM cart 
WHERE product_id = ?


-------------------- aggregate function --------------------
SELECT COUNT(orders.id) as count
FROM orders;


SELECT COUNT(vendor.id) as count
FROM vendor;

-------------------- join --------------------
SELECT u.id AS user_id, u.name, email, phone, u.img AS img, is_email_verified, is_approved, c.id AS id, c.is_loan_available, c.loan_rank
FROM user AS u
INNER JOIN customer as c
ON u.id = c.user_id
ORDER BY u.id DESC;


SELECT u.id AS user_id, u.name, email, phone, u.img AS img, is_email_verified, is_approved, c.id AS id, c.is_loan_available, c.loan_rank
FROM user AS u
INNER JOIN customer as c
ON u.id = c.user_id
WHERE u.name LIKE '%${key}%'
ORDER BY u.id DESC;


SELECT u.id, u.name AS user_name, v.name AS vendor_name, p.name AS product_name, p.price, o.quantity, (p.price * o.quantity) AS total 
FROM orders AS o
INNER JOIN customer AS c
ON o.customer_id = c.id
INNER JOIN vendor AS v
ON o.vendor_id = v.id
INNER JOIN product AS p
ON o.product_id = p.id
INNER JOIN user AS u
ON c.user_id = u.id
ORDER BY o.id DESC


SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
FROM product AS p
INNER JOIN vendor AS v
ON p.vendor_id = v.id
ORDER BY p.id DESC;


SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
FROM product AS p
INNER JOIN vendor AS v
ON p.vendor_id = v.id
WHERE p.id = ?;


SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
FROM product AS p
INNER JOIN vendor AS v
ON p.vendor_id = v.id
WHERE p.price BETWEEN ? AND ?
ORDER BY p.id DESC;


SELECT u.id AS user_id, u.name AS username, email, phone, u.img AS user_img, is_email_verified, is_approved, v.id AS vendor_id, v.name AS vendor_name, v.description, v.img AS vendor_img
FROM user as u
INNER JOIN vendor as v
N u.id = v.user_id
ORDER BY u.id DESC


SELECT u.id AS user_id, u.name AS username, email, phone, u.img AS user_img, is_email_verified, is_approved, v.id AS vendor_id, v.name AS vendor_name, v.description, v.img AS vendor_img
FROM user as u
INNER JOIN vendor as v
ON u.id = v.user_id
WHERE u.name LIKE '%${key}%' OR v.name LIKE '%${key}%'
ORDER BY u.id DESC;


-------------------- subquery --------------------
SELECT *
FROM vendor
WHERE user_id = (
    SELECT id
    FROM user
    WHERE session = ?
);


UPDATE vendor
SET name = ?, description = ?
WHERE user_id = (
    SELECT id
    FROM user
    WHERE session = ?
);


UPDATE vendor
SET img = ?
WHERE user_id = (
    SELECT id
    FROM user
    WHERE session = ?
);


SELECT name
FROM category
WHERE id IN (
    SELECT category_id 
    FROM product_to_category
    WHERE product_id = ?
);


SELECT *
FROM vendor
WHERE user_id = (
    SELECT id
    FROM user
    WHERE session = ?
);


-------------------- join & subquery --------------------
SELECT p.id, p.name, p.price, c.quantity, (p.price * c.quantity) as total, c.customer_id as customer_id
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
);


SELECT p.id, p.vendor_id, p.name, p.description, p.price, p.img, p.is_available, v.name AS vendor_name, v.description AS vendor_description, v.img AS vendor_img
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
ORDER BY p.id DESC;
