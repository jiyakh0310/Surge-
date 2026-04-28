USE surge_db;

INSERT INTO users (user_id, username, email, password, role) VALUES
  (1, 'organizer1', 'organizer1@surge.com', 'pass123', 'organizer'),
  (2, 'organizer2', 'organizer2@surge.com', 'pass123', 'organizer'),
  (3, 'participant1', 'participant1@surge.com', 'pass123', 'participant'),
  (4, 'participant2', 'participant2@surge.com', 'pass123', 'participant'),
  (5, 'participant3', 'participant3@surge.com', 'pass123', 'participant'),
  (6, 'participant4', 'participant4@surge.com', 'pass123', 'participant'),
  (7, 'participant5', 'participant5@surge.com', 'pass123', 'participant'),
  (8, 'participant6', 'participant6@surge.com', 'pass123', 'participant'),
  (9, 'participant7', 'participant7@surge.com', 'pass123', 'participant'),
  (10, 'participant8', 'participant8@surge.com', 'pass123', 'participant')
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  email = VALUES(email),
  password = VALUES(password),
  role = VALUES(role);

INSERT INTO clubs (id, name, description) VALUES
  (1, 'Coding Club', 'Competitive coding and problem solving'),
  (2, 'AI Society', 'Machine learning, AI, and data science'),
  (3, 'Design Collective', 'Product, UI/UX, and visual design'),
  (4, 'Robotics Guild', 'Robotics and embedded systems'),
  (5, 'Cyber Cell', 'Security and capture-the-flag community')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

INSERT INTO venues (id, name, capacity, venue_timings, poc_name, poc_contact) VALUES
  (1, 'Main Auditorium', 350, '09:00 AM - 08:00 PM', 'Aarav Singh', '9000000001'),
  (2, 'Innovation Lab', 120, '10:00 AM - 09:00 PM', 'Isha Nair', '9000000002'),
  (3, 'Seminar Hall A', 180, '09:00 AM - 06:00 PM', 'Kabir Jain', '9000000003'),
  (4, 'Tech Block LT-1', 220, '08:00 AM - 05:00 PM', 'Riya Das', '9000000004'),
  (5, 'Open Arena', 600, '04:00 PM - 10:00 PM', 'Nikhil Rao', '9000000005')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  capacity = VALUES(capacity),
  venue_timings = VALUES(venue_timings),
  poc_name = VALUES(poc_name),
  poc_contact = VALUES(poc_contact);

INSERT INTO events (id, title, description, event_date, venue_id, club_id) VALUES
  (1, 'SURGE 2.0 CTF', 'Cybersecurity CTF challenge for all skill levels', '2026-05-05 10:00:00', 2, 5),
  (2, 'AI Workshop', 'Hands-on workshop on LLMs and prompt engineering', '2026-05-07 11:00:00', 3, 2),
  (3, 'Hackathon Night', 'Overnight hackathon with mentorship and judging', '2026-05-09 20:00:00', 1, 1),
  (4, 'Design Sprint', 'Rapid design and prototyping challenge', '2026-05-12 10:30:00', 4, 3),
  (5, 'Robo Race', 'Robot obstacle race and autonomous challenge', '2026-05-15 03:00:00', 5, 4),
  (6, 'Cloud Bootcamp', 'Deploy full-stack apps using cloud native tooling', '2026-05-18 09:30:00', 2, 1),
  (7, 'Data Dive', 'Data analysis and visualization mini-competition', '2026-05-20 01:00:00', 3, 2),
  (8, 'App Showcase', 'Student product showcase and live demos', '2026-05-22 05:00:00', 1, 3)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  event_date = VALUES(event_date),
  venue_id = VALUES(venue_id),
  club_id = VALUES(club_id);

INSERT INTO participants (id, name, email, phone, college, event_id) VALUES
  (1, 'Ananya Sharma', 'ananya@college.edu', '9100000001', 'ABC College', 1),
  (2, 'Rohan Mehta', 'rohan@college.edu', '9100000002', 'ABC College', 2),
  (3, 'Priya Nair', 'priya@college.edu', '9100000003', 'XYZ University', 3),
  (4, 'Aditya Verma', 'aditya@college.edu', '9100000004', 'XYZ University', 4),
  (5, 'Neha Joshi', 'neha@college.edu', '9100000005', 'PQR Institute', 5),
  (6, 'Karan Gupta', 'karan@college.edu', '9100000006', 'PQR Institute', 6),
  (7, 'Sneha Kulkarni', 'sneha@college.edu', '9100000007', 'LMN College', 7),
  (8, 'Arjun Patel', 'arjun@college.edu', '9100000008', 'LMN College', 8),
  (9, 'Diya Kapoor', 'diya@college.edu', '9100000009', 'ABC College', 1),
  (10, 'Vikram Rao', 'vikram@college.edu', '9100000010', 'XYZ University', 3)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  phone = VALUES(phone),
  college = VALUES(college),
  event_id = VALUES(event_id);

INSERT INTO registrations (registration_id, participant_id, event_id, registration_date, status) VALUES
  (1, 1, 1, '2026-04-21', 'Confirmed'),
  (2, 2, 2, '2026-04-21', 'Confirmed'),
  (3, 3, 3, '2026-04-22', 'Confirmed'),
  (4, 4, 4, '2026-04-22', 'Confirmed'),
  (5, 5, 5, '2026-04-23', 'Confirmed'),
  (6, 6, 6, '2026-04-23', 'Confirmed'),
  (7, 7, 7, '2026-04-24', 'Pending'),
  (8, 8, 8, '2026-04-24', 'Confirmed'),
  (9, 9, 1, '2026-04-25', 'Confirmed'),
  (10, 10, 3, '2026-04-25', 'Pending')
ON DUPLICATE KEY UPDATE
  participant_id = VALUES(participant_id),
  event_id = VALUES(event_id),
  registration_date = VALUES(registration_date),
  status = VALUES(status);

INSERT INTO sponsors (sponsor_id, sponsor_name, contact_no, event_id, contribution_amount) VALUES
  (1, 'Nebula Tech', '9200000001', 1, 25000.00),
  (2, 'CodeForge', '9200000002', 2, 18000.00),
  (3, 'Quantum Labs', '9200000003', 3, 30000.00),
  (4, 'Pixel Partners', '9200000004', 4, 12000.00),
  (5, 'RoboCore', '9200000005', 5, 22000.00),
  (6, 'CloudNest', '9200000006', 6, 20000.00),
  (7, 'DataBridge', '9200000007', 7, 15000.00),
  (8, 'AppVerse', '9200000008', 8, 17000.00),
  (9, 'CyberShield', '9200000009', 1, 21000.00),
  (10, 'DesignHive', '9200000010', 4, 11000.00)
ON DUPLICATE KEY UPDATE
  sponsor_name = VALUES(sponsor_name),
  contact_no = VALUES(contact_no),
  event_id = VALUES(event_id),
  contribution_amount = VALUES(contribution_amount);

INSERT INTO budget (budget_id, event_id, budget_allocated, budget_remaining) VALUES
  (1, 1, 60000.00, 38000.00),
  (2, 2, 45000.00, 29000.00),
  (3, 3, 80000.00, 42000.00),
  (4, 4, 35000.00, 21000.00),
  (5, 5, 50000.00, 30000.00),
  (6, 6, 40000.00, 24000.00),
  (7, 7, 32000.00, 18000.00),
  (8, 8, 38000.00, 22000.00),
  (9, 1, 60000.00, 38000.00),
  (10, 3, 80000.00, 42000.00)
ON DUPLICATE KEY UPDATE
  event_id = VALUES(event_id),
  budget_allocated = VALUES(budget_allocated),
  budget_remaining = VALUES(budget_remaining);

INSERT INTO expenses (expense_id, event_id, amount, expense_type, description, expense_date) VALUES
  (1, 1, 8000.00, 'Infrastructure', 'Networking setup and servers', '2026-04-20'),
  (2, 1, 6000.00, 'Prizes', 'Winning team cash prizes', '2026-04-22'),
  (3, 2, 5000.00, 'Speakers', 'Guest speaker honorarium', '2026-04-21'),
  (4, 2, 7000.00, 'Logistics', 'Workshop kits and printed material', '2026-04-24'),
  (5, 3, 15000.00, 'Food', 'Night snacks and meals', '2026-04-23'),
  (6, 4, 9000.00, 'Supplies', 'Design sprint prototyping kits', '2026-04-24'),
  (7, 5, 11000.00, 'Hardware', 'Robot track and sensors', '2026-04-25'),
  (8, 6, 10000.00, 'Cloud Credits', 'Platform credits and support', '2026-04-25'),
  (9, 7, 8500.00, 'Analytics', 'Data tools and dashboard setup', '2026-04-26'),
  (10, 8, 12000.00, 'Production', 'Stage setup and streaming', '2026-04-26')
ON DUPLICATE KEY UPDATE
  event_id = VALUES(event_id),
  amount = VALUES(amount),
  expense_type = VALUES(expense_type),
  description = VALUES(description),
  expense_date = VALUES(expense_date);

INSERT INTO goodies (goodie_id, goodie_name, sponsor_id, event_id, committee_id) VALUES
  (1, 'CTF Tee', 1, 1, 101),
  (2, 'AI Notebook', 2, 2, 102),
  (3, 'Hackathon Hoodie', 3, 3, 103),
  (4, 'Design Stickers', 4, 4, 104),
  (5, 'Robo Cap', 5, 5, 105),
  (6, 'Cloud Bottle', 6, 6, 106),
  (7, 'Data Badge', 7, 7, 107),
  (8, 'Showcase Lanyard', 8, 8, 108),
  (9, 'Cyber Wristband', 9, 1, 109),
  (10, 'Sketch Pad', 10, 4, 110)
ON DUPLICATE KEY UPDATE
  goodie_name = VALUES(goodie_name),
  sponsor_id = VALUES(sponsor_id),
  event_id = VALUES(event_id),
  committee_id = VALUES(committee_id);

INSERT INTO goodie_distribution (distribution_id, participant_id, goodie_id, status) VALUES
  (1, 1, 1, 'collected'),
  (2, 2, 2, 'collected'),
  (3, 3, 3, 'pending'),
  (4, 4, 4, 'collected'),
  (5, 5, 5, 'pending'),
  (6, 6, 6, 'collected'),
  (7, 7, 7, 'pending'),
  (8, 8, 8, 'collected'),
  (9, 9, 9, 'pending'),
  (10, 10, 10, 'collected')
ON DUPLICATE KEY UPDATE
  participant_id = VALUES(participant_id),
  goodie_id = VALUES(goodie_id),
  status = VALUES(status);
