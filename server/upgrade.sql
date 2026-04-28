-- server/upgrade.sql
CREATE DATABASE IF NOT EXISTS surge_db;
USE surge_db;

-- 1. Users Table (Ensure it exists and has the correct structure)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('organizer', 'participant') DEFAULT 'participant'
);

-- 2. Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    club_type TEXT
);

-- 3. Venues Table
CREATE TABLE IF NOT EXISTS venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_name VARCHAR(100) NOT NULL,
    capacity INT,
    venue_timings VARCHAR(100),
    poc_id INT NULL
);

-- 4. Events Table
CREATE TABLE IF NOT EXISTS events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    club_id INT,
    venue_id INT,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE SET NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE SET NULL
);

-- 5. Participants Table
CREATE TABLE IF NOT EXISTS participants (
    participant_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    college VARCHAR(150)
);

-- 6. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT,
    event_id INT,
    registration_date DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(50) DEFAULT 'Confirmed',
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- 7. Sponsors Table
CREATE TABLE IF NOT EXISTS sponsors (
    sponsor_id INT AUTO_INCREMENT PRIMARY KEY,
    sponsor_name VARCHAR(100) NOT NULL,
    contact_no VARCHAR(20),
    event_id INT,
    contribution_amount DECIMAL(10, 2),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- 8. Budget Table
CREATE TABLE IF NOT EXISTS budget (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    budget_allocated DECIMAL(10, 2),
    budget_remaining DECIMAL(10, 2),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- 9. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    amount DECIMAL(10, 2),
    expense_type VARCHAR(100),
    description VARCHAR(255),
    expense_date DATE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- 10. Goodies Table
CREATE TABLE IF NOT EXISTS goodies (
    goodie_id INT AUTO_INCREMENT PRIMARY KEY,
    goodie_name VARCHAR(100) NOT NULL,
    sponsor_id INT,
    event_id INT,
    committee_id INT NULL,
    FOREIGN KEY (sponsor_id) REFERENCES sponsors(sponsor_id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE SET NULL
);

-- 11. Goodie Distribution Table
CREATE TABLE IF NOT EXISTS goodie_distribution (
    distribution_id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT,
    goodie_id INT,
    status ENUM('pending', 'collected') DEFAULT 'pending',
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE,
    FOREIGN KEY (goodie_id) REFERENCES goodies(goodie_id) ON DELETE CASCADE
);

-- Insert Dummy Data
INSERT IGNORE INTO users (username, email, password, role) VALUES 
('Organizer User', 'organizer@surge.com', 'organizer123', 'organizer'),
('Student User', 'student@surge.com', 'student123', 'participant');

INSERT IGNORE INTO clubs (club_name, club_type) VALUES 
('Tech Club', 'Technology and Coding'), 
('Design Hub', 'UI/UX and Graphic Design'),
('Robotics Society', 'Robotics and Automation');

INSERT IGNORE INTO venues (venue_name, capacity, venue_timings) VALUES 
('Main Auditorium', 500, '09:00 AM - 06:00 PM'), 
('Seminar Hall 1', 120, '10:00 AM - 04:00 PM'),
('Open Theater', 1000, '05:00 PM - 10:00 PM');

INSERT IGNORE INTO events (event_name, description, event_date, club_id, venue_id) VALUES 
('SURGE 2.0 CTF', 'Capture the Flag competition for cybersecurity enthusiasts.', '2026-05-15 10:00:00', 1, 1),
('AI Workshop', 'Hands-on session with Large Language Models.', '2026-05-20 14:00:00', 1, 2),
('Hackathon Night', '24-hour coding marathon to build impactful projects.', '2026-06-01 09:00:00', 1, 3);

INSERT IGNORE INTO sponsors (sponsor_name, contact_no, event_id, contribution_amount) VALUES 
('Google Cloud', '1234567890', 1, 2000.00),
('Microsoft', '0987654321', 3, 1500.00),
('Local Tech Shop', '1122334455', 2, 500.00);

INSERT IGNORE INTO budget (event_id, budget_allocated, budget_remaining) VALUES 
(1, 5000.00, 5000.00),
(2, 2000.00, 2000.00),
(3, 10000.00, 10000.00);
