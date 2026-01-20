-- Database Schema for Paracuru Veículos

CREATE DATABASE IF NOT EXISTS paracuru_db;
USE paracuru_db;

-- Seed Data (Admin)
-- Default admin: admin / admin123 (Hash should be generated in app, here is a placeholder or script user must run)
-- For MVP, we will allow creating admin via a script or route.

-- Seed Locations (Simplified)
CREATE TABLE IF NOT EXISTS estados (
    uf VARCHAR(2) PRIMARY KEY,
    name VARCHAR(100)
);

INSERT INTO estados (uf, name) VALUES 
('CE', 'Ceará'), ('SP', 'São Paulo'), ('RJ', 'Rio de Janeiro'),
('AC', 'Acre'), ('AL', 'Alagoas'), ('AP', 'Amapá'), ('AM', 'Amazonas'),
('BA', 'Bahia'), ('DF', 'Distrito Federal'), ('ES', 'Espírito Santo'),
('GO', 'Goiás'), ('MA', 'Maranhão'), ('MT', 'Mato Grosso'),
('MS', 'Mato Grosso do Sul'), ('MG', 'Minas Gerais'), ('PA', 'Pará'),
('PB', 'Paraíba'), ('PR', 'Paraná'), ('PE', 'Pernambuco'),
('PI', 'Piauí'), ('RN', 'Rio Grande do Norte'), ('RS', 'Rio Grande do Sul'),
('RO', 'Rondônia'), ('RR', 'Roraima'), ('SC', 'Santa Catarina'),
('SE', 'Sergipe'), ('TO', 'Tocantins')
ON DUPLICATE KEY UPDATE name=name;

-- Cities Table (Added to support Foreign Key)
CREATE TABLE IF NOT EXISTS cidades (
    id INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    uf VARCHAR(2),
    FOREIGN KEY (uf) REFERENCES estados(uf)
);
-- Note: Cities data should be imported from municipios.json

-- Fabricantes Table
CREATE TABLE IF NOT EXISTS fabricantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO fabricantes (id, nome) VALUES 
(1, 'Chevrolet'),
(2, 'Volkswagen'),
(3, 'Fiat'),
(4, 'Ford'),
(5, 'Toyota'),
(6, 'Honda'),
(7, 'Hyundai'),
(8, 'Renault'),
(9, 'Nissan'),
(10, 'Jeep'),
(11, 'Mitsubishi'),
(12, 'Citroën'),
(13, 'Peugeot'),
(14, 'BMW'),
(15, 'Mercedes-Benz'),
(16, 'Audi'),
(17, 'Kia'),
(18, 'Volvo'),
(19, 'Land Rover'),
(20, 'Caoa Chery'),
(21, 'JAC Motors'),
(22, 'BYD'),
(23, 'GWM'),
(24, 'Troller'),
(25, 'Suzuki')
ON DUPLICATE KEY UPDATE nome=nome;

-- Modelos Table
CREATE TABLE IF NOT EXISTS modelos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fabricante_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    FOREIGN KEY (fabricante_id) REFERENCES fabricantes(id)
);

INSERT INTO modelos (id, fabricante_id, nome) VALUES 
(1, 1, 'Onix'), (2, 1, 'Tracker'), (3, 1, 'S10'), (4, 1, 'Cruze'), (5, 1, 'Spin'),
(6, 2, 'Gol'), (7, 2, 'Polo'), (8, 2, 'T-Cross'), (9, 2, 'Nivus'), (10, 2, 'Amarok'),
(11, 3, 'Strada'), (12, 3, 'Argo'), (13, 3, 'Mobi'), (14, 3, 'Toro'), (15, 3, 'Pulse'),
(16, 4, 'Ranger'), (17, 4, 'Mustang'), (18, 4, 'Bronco'), (19, 4, 'Maverick'),
(20, 5, 'Corolla'), (21, 5, 'Hilux'), (22, 5, 'Yaris'), (23, 5, 'Corolla Cross'), (24, 5, 'SW4'),
(25, 6, 'Civic'), (26, 6, 'HR-V'), (27, 6, 'City'), (28, 6, 'ZR-V'),
(29, 7, 'HB20'), (30, 7, 'Creta'), (31, 7, 'Tucson'),
(32, 8, 'Kwid'), (33, 8, 'Duster'), (34, 8, 'Oroch'), (35, 8, 'Master'),
(36, 9, 'Kicks'), (37, 9, 'Versa'), (38, 9, 'Sentra'), (39, 9, 'Frontier'),
(40, 10, 'Renegade'), (41, 10, 'Compass'), (42, 10, 'Commander'),
(43, 20, 'Tiggo 5x'), (44, 20, 'Tiggo 7'), (45, 20, 'Tiggo 8'),
(46, 22, 'Dolphin'), (47, 22, 'Song Plus'), (48, 22, 'Seal'),
(49, 23, 'Haval H6'), (50, 23, 'Ora 03')
ON DUPLICATE KEY UPDATE nome=nome;

-- Users table
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Plans table (Static data)
CREATE TABLE IF NOT EXISTS planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    duracao_dias INT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL
);

INSERT INTO planos (nome, duracao_dias, preco) VALUES 
('Quinzenal', 15, 30.00),
('Mensal', 30, 50.00)
ON DUPLICATE KEY UPDATE preco=preco;

-- Anuncios table
CREATE TABLE IF NOT EXISTS anuncios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    fabricante_id INT NOT NULL,
    modelo_id INT NOT NULL,
    ano_fabricacao INT,
    km INT,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    estado_id VARCHAR(2) NOT NULL,
    cidade_id INT NOT NULL,
    status ENUM('pending_payment', 'active', 'sold', 'expired') DEFAULT 'pending_payment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (fabricante_id) REFERENCES fabricantes(id),
    FOREIGN KEY (modelo_id) REFERENCES modelos(id),
    FOREIGN KEY (estado_id) REFERENCES estados(uf),
    FOREIGN KEY (cidade_id) REFERENCES cidades(id)      
);

-- Payments
CREATE TABLE IF NOT EXISTS pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_ref VARCHAR(255), -- Mercado Pago Preference ID or Payment ID
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    usuario_id INT NOT NULL,
    anuncio_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id)
);