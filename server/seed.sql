INSERT IGNORE INTO clubs (id, name, description) VALUES
  (1, 'Coding Club', 'Organizes coding challenges and hackathons'),
  (2, 'AI Society', 'Runs AI and ML learning sessions'),
  (3, 'Design Guild', 'Focuses on product and UI/UX design');

INSERT IGNORE INTO venues (id, name, capacity, venue_timings, poc_name, poc_contact) VALUES
  (1, 'Main Auditorium', 300, '09:00 AM - 06:00 PM', 'Arjun Mehta', '9876500001'),
  (2, 'Innovation Lab', 120, '10:00 AM - 08:00 PM', 'Nisha Rao', '9876500002'),
  (3, 'Seminar Hall A', 180, '09:00 AM - 05:00 PM', 'Karan Iyer', '9876500003');

INSERT IGNORE INTO events (id, title, description, event_date, venue_id, club_id) VALUES
  (1, 'SURGE 2.0 CTF', 'Capture the flag cybersecurity competition', '2026-05-02 10:00:00', 2, 1),
  (2, 'AI Workshop', 'Hands-on generative AI workshop for beginners', '2026-05-04 11:00:00', 3, 2),
  (3, 'Hackathon Night', 'Overnight team hackathon with mentor support', '2026-05-06 20:00:00', 1, 1),
  (4, 'Design Sprint', 'Rapid prototyping and product design challenge', '2026-05-08 02:00:00', 3, 3),
  (5, 'Robo Race', 'Autonomous robot race and obstacle challenge', '2026-05-10 04:00:00', 1, 1);
