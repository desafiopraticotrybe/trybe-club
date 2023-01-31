DROP DATABASE IF EXISTS trybeclub_db;

CREATE DATABASE IF NOT EXISTS trybeclub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE trybeclub_db;

CREATE TABLE members (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(45) NOT NULL,
    last_name VARCHAR(45) NOT NULL,
    email VARCHAR(60) NOT NULL,
    phone VARCHAR(20),
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE plans (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    description VARCHAR(100),
    price DECIMAL(5 , 2 ) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE members_plans (
    member_id INT NOT NULL,
    plan_id INT NOT NULL,
    PRIMARY KEY (member_id , plan_id),
    FOREIGN KEY (member_id)
        REFERENCES members (id),
    FOREIGN KEY (plan_id)
        REFERENCES plans (id)
);

INSERT INTO members 
    (first_name, last_name, email, phone) 
VALUES
    ('Carlos Márcio', 'Russo', 'cmrusso@email.com', '51992824816'),
    ('Adão', 'Ferreira', 'adaofer@email.com', '21985336211'),
    ('Jandira', 'Soares', 'jandiras@email.com', '48994325998');
    
INSERT INTO plans 
    (name, description, price) 
VALUES
	('Listener', 'Plano que garante acesso a 4 TrybeTalks exclusivos', 19.90),
	('Active', 'Plano que garante acesso a um Bootcamp por módulo de curso', 29.90),
	('Full Length', 'Plano que garante acesso total aos benefícios', 39.90);

INSERT INTO members_plans 
    (member_id, plan_id)
VALUES
	(1, 2),
    (2, 1),
    (3, 3);