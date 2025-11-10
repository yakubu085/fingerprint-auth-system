-- Enhanced Database Schema for Complete E-Voting System
-- This file updates the existing basic schema to support full election management

-- Update existing users table with new fields
ALTER TABLE users
ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user',
ADD COLUMN phone VARCHAR(20),
ADD COLUMN matric_number VARCHAR(50),
ADD COLUMN profile_picture VARCHAR(255),
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create elections table
CREATE TABLE elections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    election_type VARCHAR(100),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create candidates table
CREATE TABLE candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    election_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    photo VARCHAR(255),
    manifesto TEXT,
    position VARCHAR(100),
    vote_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
);

-- Create votes table to replace the basic voted table
DROP TABLE IF EXISTS voted;
CREATE TABLE votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    election_id INT NOT NULL,
    candidate_id INT NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fingerprint_template VARCHAR(255), -- Store template for audit
    UNIQUE KEY unique_user_election (user_id, election_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (election_id) REFERENCES elections(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- Keep the existing joined table as user_activity_history
RENAME TABLE joined TO user_activity_history;

-- Create election_settings table for additional configuration
CREATE TABLE election_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    election_id INT NOT NULL,
    allow_nomination BOOLEAN DEFAULT TRUE,
    require_fingerprint BOOLEAN DEFAULT TRUE,
    public_results BOOLEAN DEFAULT TRUE,
    max_candidates_per_position INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
);

-- Create audit_log table for security auditing
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_elections_dates ON elections(start_date, end_date);
CREATE INDEX idx_candidates_election ON candidates(election_id);
CREATE INDEX idx_votes_user_election ON votes(user_id, election_id);
CREATE INDEX idx_votes_election ON votes(election_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Insert default admin user (password: admin123)
INSERT INTO users (f_name, l_name, email, password, role, matric_number)
VALUES ('Admin', 'User', 'admin@evoting.com', 'admin123', 'admin', 'ADMIN001');

-- Create view for active elections with candidate count
CREATE VIEW active_elections_view AS
SELECT
    e.*,
    COUNT(c.id) as candidate_count,
    CASE
        WHEN NOW() < e.start_date THEN 'upcoming'
        WHEN NOW() BETWEEN e.start_date AND e.end_date THEN 'active'
        WHEN NOW() > e.end_date THEN 'completed'
    ELSE 'unknown'
    END as current_status
FROM elections e
LEFT JOIN candidates c ON e.id = c.election_id
WHERE e.status != 'completed'
GROUP BY e.id;

-- Create view for election results
CREATE VIEW election_results_view AS
SELECT
    e.id as election_id,
    e.title as election_title,
    c.id as candidate_id,
    c.name as candidate_name,
    c.photo,
    c.manifesto,
    c.position,
    COUNT(v.id) as total_votes,
    ROUND((COUNT(v.id) / (SELECT COUNT(*) FROM votes v2 WHERE v2.election_id = e.id)) * 100, 2) as vote_percentage
FROM elections e
LEFT JOIN candidates c ON e.id = c.election_id
LEFT JOIN votes v ON c.id = v.candidate_id
WHERE e.status = 'completed'
GROUP BY e.id, c.id
ORDER BY e.id, total_votes DESC;