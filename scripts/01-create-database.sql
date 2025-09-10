-- Script para crear la base de datos y tablas iniciales
CREATE DATABASE IF NOT EXISTS mental;
USE mental;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'therapist') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de sesiones de terapia
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  therapist_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_date DATETIME NOT NULL,
  duration INT DEFAULT 60, -- duración en minutos
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de recursos de salud mental
CREATE TABLE IF NOT EXISTS mental_health_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('article', 'exercise', 'meditation', 'tip') NOT NULL,
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
