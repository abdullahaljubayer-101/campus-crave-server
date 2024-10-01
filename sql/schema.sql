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