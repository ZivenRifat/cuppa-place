CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(40),
  role ENUM('user','mitra','admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cafes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  address VARCHAR(255),
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,
  instagram VARCHAR(120),
  opening_hours JSON NULL,
  cover_url VARCHAR(255),
  phone VARCHAR(40),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FULLTEXT KEY ft_cafes (name, address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cafe_owners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  cafe_id INT NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uniq_owner (user_id, cafe_id),
  CONSTRAINT fk_owner_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_owner_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cafe_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80),
  price DECIMAL(12,2) NOT NULL,
  description TEXT,
  photo_url VARCHAR(255),
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_menu_cafe (cafe_id),
  CONSTRAINT fk_menu_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cafe_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL,
  text TEXT,
  status ENUM('published','pending') NOT NULL DEFAULT 'published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  cafe_id INT NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uniq_fav (user_id, cafe_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cafe_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cafe_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_photo_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) NOT NULL,
  code VARCHAR(10) NOT NULL,
  reason VARCHAR(40) DEFAULT 'register',
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (name, email, password_hash, phone, role, created_at, updated_at)
SELECT 'Super Admin', 'admin@cuppa.local', '$2a$10$9m3bSut0c0NuvNnTEtJzguNjNKZkWm2lQnYBf2Jx1jv0YxdkU/j.S', NULL, 'admin', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@cuppa.local');
