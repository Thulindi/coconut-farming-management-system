-- 1. Roles Table 
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Users Table 
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50),
    officer_id VARCHAR(100)
);

-- 3. User_Roles Table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 4. Profiles Table 
CREATE TABLE profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,         
    full_name VARCHAR(255),
    profile_photo LONGTEXT,                 
    district VARCHAR(100),
    phone VARCHAR(20),
    department VARCHAR(100),
    designation VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. System Logs Table 
CREATE TABLE system_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,                         
    action VARCHAR(255) NOT NULL,
    details TEXT,                           
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
