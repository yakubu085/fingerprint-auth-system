CREATE TABLE biometric(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    template VARCHAR(540) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
)

CREATE TABLE users(
    id INT PRIMARY KEY AUTO_INCREMENT,
    f_name VARCHAR(15) NOT NULL,
    l_name VARCHAR(15) NOT NULL,
    email VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL
)

CREATE TABLE joined(
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)

CREATE TABLE voted(
    user_id INT NOt NULL,
    voted ENUM('true', 'false') DEFAULT 'false',
    FOREIGN KEY (user_id) REFERENCES users(id)
)

SELECT * FROM users
SELECT * FROM biometric
SELECT * FROM voted
SELECT * FROM joined