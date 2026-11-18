-- TransitPass schema (re-runnable: drops and recreates tables)
CREATE DATABASE IF NOT EXISTS transitpass CHARACTER SET utf8mb4;
USE transitpass;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bus_passes, payments, documents, applications, pass_types, routes, users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','admin') NOT NULL DEFAULT 'student',
  photo VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  source VARCHAR(80) NOT NULL,
  destination VARCHAR(80) NOT NULL,
  fare DECIMAL(8,2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE pass_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  duration_days INT NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  route_id INT NOT NULL,
  pass_type_id INT NOT NULL,
  start_date DATE NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  status ENUM('Pending','Approved','Rejected','Pass Issued') NOT NULL DEFAULT 'Pending',
  payment_status ENUM('Unpaid','Paid') NOT NULL DEFAULT 'Unpaid',
  rejection_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (route_id) REFERENCES routes(id),
  FOREIGN KEY (pass_type_id) REFERENCES pass_types(id)
);

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  method ENUM('UPI','Card','Net Banking') NOT NULL,
  transaction_id VARCHAR(40) NOT NULL UNIQUE,
  status ENUM('Success') NOT NULL DEFAULT 'Success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE bus_passes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  pass_number VARCHAR(30) NOT NULL UNIQUE,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
