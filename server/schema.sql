-- server/schema.sql
CREATE DATABASE IF NOT EXISTS surge_db;
USE surge_db;

-- 1. Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_name VARCHAR(100)
);

-- 2. Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT,
    location VARCHAR(255)
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    club_id INT,
    venue_id INT,
    budget_allocated DECIMAL(10, 2) DEFAULT 0.00,
    INDEX (event_date),
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL
);

-- 4. Participants Table (Updated with College)
CREATE TABLE IF NOT EXISTS participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    college VARCHAR(150),
    event_id INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 5. Users Table for Auth
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('admin', 'organizer', 'participant') DEFAULT 'participant'
);

-- 6. Sponsors Table
CREATE TABLE IF NOT EXISTS sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contribution DECIMAL(10, 2),
    event_id INT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 7. Budget Tracking Table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    item_name VARCHAR(150),
    amount DECIMAL(10, 2),
    expense_date DATE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- DBMS CONCEPTS: VIEWS
CREATE OR REPLACE VIEW event_details_view AS
SELECT 
    e.id, e.title, e.description, e.event_date, 
    c.name AS club_name, v.name AS venue_name, v.location,
    (SELECT COUNT(*) FROM participants WHERE event_id = e.id) AS participant_count
FROM events e
LEFT JOIN clubs c ON e.club_id = c.id
LEFT JOIN venues v ON e.venue_id = v.id;

-- DBMS CONCEPTS: STORED PROCEDURES
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetEventStats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM events) AS total_events,
        (SELECT COUNT(*) FROM participants) AS total_participants,
        (SELECT COUNT(*) FROM clubs) AS total_clubs,
        (SELECT COUNT(*) FROM sponsors) AS total_sponsors,
        (SELECT SUM(contribution) FROM sponsors) AS total_funding;
END //
DELIMITER ;

-- INITIAL DATA
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@surge.com', 'admin123', 'admin'),
('John Organizer', 'john@surge.com', 'pass123', 'organizer');

INSERT IGNORE INTO clubs (name, description, head_name) VALUES 
('Tech Club', 'All things technology and coding', 'Alex Rivet'), 
('Design Hub', 'Creative minds and UI/UX enthusiasts', 'Sarah Color'),
('Robotics Society', 'Building the future one bot at a time', 'Mike Gear');

INSERT IGNORE INTO venues (name, capacity, location) VALUES 
('Main Auditorium', 500, 'Block A, 1st Floor'), 
('Seminar Hall 1', 120, 'Block B, Ground Floor'),
('Open Theater', 1000, 'Campus Central Park');

INSERT IGNORE INTO events (title, description, event_date, club_id, venue_id, budget_allocated) VALUES 
('SURGE 2.0 CTF', 'Capture the Flag competition for cybersecurity enthusiasts.', '2026-05-15 10:00:00', 1, 1, 5000.00),
('AI Workshop', 'Hands-on session with Large Language Models.', '2026-05-20 14:00:00', 1, 2, 2000.00),
('Hackathon Night', '24-hour coding marathon to build impactful projects.', '2026-06-01 09:00:00', 1, 3, 10000.00);

INSERT IGNORE INTO sponsors (name, contribution, event_id) VALUES 
('Google Cloud', 2000.00, 1),
('Microsoft', 1500.00, 3),
('Local Tech Shop', 500.00, 2);
