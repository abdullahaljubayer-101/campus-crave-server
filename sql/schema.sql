-- >user
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) UNIQUE NOT NULL,
    `phone` varchar(20) NOT NULL,
    `password` varchar(255) NOT NULL,
    `img` varchar(255),
    `role` varchar(20) NOT NULL,
    `otp` varchar(20),
    `session` varchar(255) UNIQUE NOT NULL,
    `is_email_verified` boolean NOT NULL,
    `is_approved` boolean NOT NULL,

    PRIMARY KEY (`id`)
);

INSERT INTO `user` (
    `email`, 
    `phone`, 
    `password`, 
    `role`, 
    `is_email_verified`, 
    `is_approved`
) VALUES (
    'imjubayer08@gmail.com',
    '01980124132',
    '123456',
    'admin',
    true,
    true
);

-- >admin
CREATE TABLE `admin` (
	`id` int AUTO_INCREMENT,
    `user_id` int UNIQUE NOT NULL,
    
    PRIMARY KEY (`id`),
    CONSTRAINT user_to_admin 
    FOREIGN KEY (`user_id`) 
    REFERENCES `user`(`id`)
);

INSERT INTO `admin` (
	`user_id`
) VALUES (
	1
);

-- >customer
CREATE TABLE `customer` (
	`id` int AUTO_INCREMENT,
    `user_id` int UNIQUE NOT NULL,
    `is_loan_available` boolean NOT NULL,
    `loan_rank` int NOT NULL,
    
    PRIMARY KEY (`id`),
    CONSTRAINT user_to_customer
    FOREIGN KEY (`user_id`)
    REFERENCES `user`(`id`)
);

-- >vendor
CREATE TABLE `vendor` (
	`id` int AUTO_INCREMENT,
    `user_id` int UNIQUE NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` text,
    `img` varchar(255),
    
    PRIMARY KEY (`id`),
	CONSTRAINT user_to_vendor
    FOREIGN KEY (`user_id`)
    REFERENCES `user`(`id`)
);

-- >product
CREATE TABLE `product` (
	`id` int AUTO_INCREMENT,
    `vendor_id` int NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `price` float NOT NULL,
    `img` varchar(255) NOT NULL,
    `is_available` boolean NOT NULL,
    
    PRIMARY KEY (`id`),
    CONSTRAINT vendor_to_product
    FOREIGN KEY (`vendor_id`)
    REFERENCES `vendor`(`id`)
);

-- >category
CREATE TABLE category (
	id int AUTO_INCREMENT,
    name varchar(20) NOT NULL,
    
    PRIMARY KEY (id)
);

INSERT INTO category
(name)
VALUES
("Breakfast"),
("Lunch"),
("Snacks"),
("Dessert"),
("Beverages"),
("First Food"),
("Bengali"),
("Chinese");

-- >product to category
CREATE TABLE product_to_category (
    product_id int NOT NULL,
    category_id int NOT NULL,
    
	CONSTRAINT product_to_category
    FOREIGN KEY (product_id)
    REFERENCES product(id),
    
    CONSTRAINT category_to_product
    FOREIGN KEY (category_id)
    REFERENCES category(id)
);

-- favorite
CREATE TABLE favorite (
	customer_id int NOT NULL,
    product_id int NOT NULL,
    
    CONSTRAINT customer_to_favorite
    FOREIGN KEY (customer_id)
    REFERENCES customer(id),
    
    CONSTRAINT product_to_favorite
    FOREIGN KEY (product_id)
    REFERENCES product(id)
)

-- cart
CREATE TABLE cart (
	customer_id int NOT NULL,
    product_id int NOT NULL,
    quantity int NOT NULL,
    
    CONSTRAINT customer_to_cart
    FOREIGN KEY (customer_id)
    REFERENCES customer(id),
    
    CONSTRAINT product_to_cart
    FOREIGN KEY (product_id)
    REFERENCES product(id)
)

-- order
CREATE TABLE `order` (
	id int AUTO_INCREMENT,
    customer_id int NOT NULL,
    vendor_id int NOT NULL,
    product_id int NOT NULL,
    quantity int NOT NULL,
    
    PRIMARY KEY (id),
    
    CONSTRAINT customer_to_order
    FOREIGN KEY (customer_id)
    REFERENCES customer(id),
    
    CONSTRAINT vendor_to_order
    FOREIGN KEY (vendor_id)
    REFERENCES vendor(id),
    
    CONSTRAINT product_to_cart2
    FOREIGN KEY (product_id)
    REFERENCES product(id)
)	
