-- server/clubs-upgrade.sql
-- Run this migration once to add club logos and participant_clubs table
USE surge_db;

-- Add logo_url column to clubs if not exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'surge_db' AND TABLE_NAME = 'clubs' AND COLUMN_NAME = 'logo_url');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE clubs ADD COLUMN logo_url VARCHAR(500)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create participant_clubs table
CREATE TABLE IF NOT EXISTS participant_clubs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  club_id INT NOT NULL,
  joined_at DATE DEFAULT (CURRENT_DATE),
  UNIQUE KEY unique_user_club (user_id, club_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);

-- Insert 6 clubs with realistic logo URLs
INSERT INTO clubs (id, name, description, logo_url) VALUES
  (1, 'Tech Club', 'Technology enthusiasts exploring coding, cloud, and cutting-edge tools.', 'https://ui-avatars.com/api/?name=Tech+Club&background=7000ff&color=fff&size=128&rounded=true&bold=true'),
  (2, 'Design Hub', 'Creative minds pushing boundaries in UI/UX and graphic design.', 'https://ui-avatars.com/api/?name=Design+Hub&background=f783ac&color=fff&size=128&rounded=true&bold=true'),
  (3, 'Robotics Society', 'Building the future one robot at a time — hardware meets software.', 'https://ui-avatars.com/api/?name=Robotics&background=4ce5f1&color=0a0f1c&size=128&rounded=true&bold=true'),
  (4, 'Cultural Club', 'Celebrating art, music, dance, and cultural diversity on campus.', 'https://ui-avatars.com/api/?name=Cultural&background=b197fc&color=fff&size=128&rounded=true&bold=true'),
  (5, 'Gaming Club', 'Competitive gaming, esports tournaments, and game development.', 'https://ui-avatars.com/api/?name=Gaming&background=20c997&color=fff&size=128&rounded=true&bold=true'),
  (6, 'Entrepreneurship Cell', 'Startup culture, pitch events, and business innovation.', 'https://ui-avatars.com/api/?name=E-Cell&background=ffd43b&color=0a0f1c&size=128&rounded=true&bold=true')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  logo_url = VALUES(logo_url);
