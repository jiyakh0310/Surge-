-- server/fix-events.sql
-- Seeds 6 events only if they don't already exist.
-- Uses INSERT IGNORE with explicit IDs as requested.

USE surge_db;

INSERT IGNORE INTO events (id, title, description, event_date, venue_id, club_id) VALUES
  (1, 'SURGE 2.0 CTF', 'Capture the Flag competition for cybersecurity enthusiasts.', '2026-05-15 10:00:00', 1, 1),
  (2, 'AI Workshop', 'Hands-on GenAI sessions with practical model deployment tips.', '2026-05-20 14:00:00', 2, 1),
  (3, 'Hackathon Night', 'A full-night sprint to build bold campus tech solutions.', '2026-06-01 09:00:00', 3, 1),
  (4, 'Design Sprint', 'Rapid ideation and polished product prototyping in one day.', '2026-06-07 11:00:00', 2, 2),
  (5, 'Robo Race', 'Precision robotics challenge focused on speed and control.', '2026-06-12 16:00:00', 3, 3),
  (6, 'Startup Pitch Arena', 'Students pitch innovative startup ideas to mentors and judges.', '2026-06-18 15:30:00', 1, 6);

