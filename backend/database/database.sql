-- =====================================================================
-- FoodRescue Database Schema (MySQL 8)
-- Database Name: foodrescue_db
-- Description: Core schema connecting food donors (hostels, canteens,
--              restaurants) with NGOs to redistribute surplus food.
-- =====================================================================

-- Step 1: Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS foodrescue_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Step 2: Select and switch to the database
USE foodrescue_db;

-- ---------------------------------------------------------------------
-- TABLE 1: users
-- Purpose: Stores registered food donors and recipient NGOs.
-- Note: 'password_hash' stores secure bcrypt hashes (no plain-text passwords).
--       Public registration strictly allows only 'donor' or 'ngo' roles.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('donor', 'ngo') NOT NULL DEFAULT 'donor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TABLE 2: food_listings
-- Purpose: Surplus food posted by donors (e.g., college canteens, caterers).
-- Relationship: Many food listings belong to ONE donor (users table).
-- Foreign Key: donor_id references users(id). If a donor is removed,
--              their listings are automatically deleted (ON DELETE CASCADE).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  food_name VARCHAR(150) NOT NULL,
  description TEXT,
  food_type ENUM('veg', 'non-veg', 'both') NOT NULL DEFAULT 'veg',
  storage_details VARCHAR(255) NULL,
  quantity VARCHAR(50) NOT NULL,
  available_quantity INT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  image VARCHAR(255) NULL,
  preparation_time VARCHAR(100) NULL,
  prepared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  available_until DATETIME NOT NULL,
  status ENUM('available', 'claimed', 'expired') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_food_donor
    FOREIGN KEY (donor_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TABLE 3: food_requests
-- Purpose: Requests submitted by verified NGOs to claim food listings.
-- Relationships:
--   - food_id references food_listings(id)
--   - ngo_id  references users(id)
-- Foreign Keys: Automatically cleaned up if related food or NGO is removed.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  food_id INT NOT NULL,
  ngo_id INT NOT NULL,
  requested_quantity VARCHAR(50),
  message TEXT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'collected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_request_food
    FOREIGN KEY (food_id) REFERENCES food_listings(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_request_ngo
    FOREIGN KEY (ngo_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- OPTIONAL SAMPLE RECORDS (Demonstration & Viva Evaluation)
-- All passwords below are pre-hashed using bcrypt (cost 10) for 'password123'
-- Hash: $2b$10$TU9iR9twsLaBUP6a3KP84.XHOwLYJ.RuAR.0cy8lsYxUu.eOdil22
-- =====================================================================

-- 1. Insert Sample Users (Donors & NGOs)
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
(1, 'BITS Hostel Mess', 'donor@example.com', '+91 98765 43210', '$2b$10$TU9iR9twsLaBUP6a3KP84.XHOwLYJ.RuAR.0cy8lsYxUu.eOdil22', 'donor'),
(2, 'Asha Food Care Foundation', 'ngo@example.com', '+91 91234 56789', '$2b$10$TU9iR9twsLaBUP6a3KP84.XHOwLYJ.RuAR.0cy8lsYxUu.eOdil22', 'ngo'),
(3, 'RV College Canteen', 'rvcanteen@example.com', '+91 99887 76655', '$2b$10$TU9iR9twsLaBUP6a3KP84.XHOwLYJ.RuAR.0cy8lsYxUu.eOdil22', 'donor'),
(4, 'Robin Hood Army Bengaluru', 'robinhood@example.com', '+91 90012 34567', '$2b$10$TU9iR9twsLaBUP6a3KP84.XHOwLYJ.RuAR.0cy8lsYxUu.eOdil22', 'ngo')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Sample Food Listings
INSERT INTO food_listings (id, donor_id, food_name, description, quantity, pickup_address, prepared_at, available_until, status) VALUES
(1, 1, 'Dal Rice & Mixed Vegetable Curry', 'Surplus from dinner mess. Freshly packed in clean steel containers.', '35 servings', 'Block B Hostel Mess, Campus Gate 2, Bengaluru', NOW(), DATE_ADD(NOW(), INTERVAL 8 HOUR), 'available'),
(2, 3, 'Fresh Chapathis & Dal Tadka', 'Lunch buffet surplus. Wrapped hygienically in food-grade foil.', '40 servings', 'RV College Main Canteen, Mysore Road, Bengaluru', NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), 'available'),
(3, 1, 'Vegetable Pulao & Raita', 'Packed boxed meals from college symposium lunch.', '25 servings', 'Block B Hostel Mess, Campus Gate 2, Bengaluru', NOW(), DATE_ADD(NOW(), INTERVAL 12 HOUR), 'claimed')
ON DUPLICATE KEY UPDATE food_name=VALUES(food_name);

-- 3. Insert Sample Food Requests
INSERT INTO food_requests (id, food_id, ngo_id, requested_quantity, status, request_date) VALUES
(1, 1, 2, '35 servings', 'pending', NOW()),
(2, 3, 4, '25 servings', 'accepted', NOW())
ON DUPLICATE KEY UPDATE status=VALUES(status);
