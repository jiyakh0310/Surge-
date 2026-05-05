-- server/fix-clubs.sql
-- Fix for: Unknown column 'logo_url' in 'field list'
-- If you see a duplicate column error while adding `logo_url`, it can be ignored.

USE surge_db;

-- Safely add logo_url column if missing (works on MySQL 8+ and older 5.7)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'clubs'
    AND COLUMN_NAME = 'logo_url'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE clubs ADD COLUMN logo_url VARCHAR(500)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert dummy clubs safely (only if they don't already exist by name)
INSERT INTO clubs (name, description, logo_url)
SELECT 'Tech Club',
       'Technology enthusiasts exploring coding, cloud, and cutting-edge tools.',
       'https://ui-avatars.com/api/?name=Tech+Club&background=7000ff&color=fff&size=128&rounded=true&bold=true'
WHERE NOT EXISTS (SELECT 1 FROM clubs WHERE name = 'Tech Club');

INSERT INTO clubs (name, description, logo_url)
SELECT 'Design Hub',
       'Creative minds pushing boundaries in UI/UX and graphic design.',
       'https://ui-avatars.com/api/?name=Design+Hub&background=f783ac&color=fff&size=128&rounded=true&bold=true'
WHERE NOT EXISTS (SELECT 1 FROM clubs WHERE name = 'Design Hub');

INSERT INTO clubs (name, description, logo_url)
SELECT 'Robotics Society',
       'Building the future one robot at a time — hardware meets software.',
       'https://ui-avatars.com/api/?name=Robotics&background=4ce5f1&color=0a0f1c&size=128&rounded=true&bold=true'
WHERE NOT EXISTS (SELECT 1 FROM clubs WHERE name = 'Robotics Society');

INSERT INTO clubs (name, description, logo_url)
SELECT 'Cultural Club',
       'Celebrating art, music, dance, and cultural diversity on campus.',
       'https://ui-avatars.com/api/?name=Cultural&background=b197fc&color=fff&size=128&rounded=true&bold=true'
WHERE NOT EXISTS (SELECT 1 FROM clubs WHERE name = 'Cultural Club');

INSERT INTO clubs (name, description, logo_url)
SELECT 'Gaming Club',
       'Competitive gaming, esports tournaments, and game development.',
       'https://ui-avatars.com/api/?name=Gaming&background=20c997&color=fff&size=128&rounded=true&bold=true'
WHERE NOT EXISTS (SELECT 1 FROM clubs WHERE name = 'Gaming Club');

INSERT INTO clubs (name, description, logo_url)
SELECT 'Entrepreneurship Cell',
       'Startup culture, pitch events, and business innovation.',
       'https://ui-avatars.com/api/?name=E-Cell&background=ffd43b&color=0a0f1c&size=128&rounded=true&bold=true'
WHERE NOT EXISTS (SELECT 1 FROM clubs WHERE name = 'Entrepreneurship Cell');

