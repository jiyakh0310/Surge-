// server/routes/events.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all events with club and venue names
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id AS event_id,
        e.title AS event_name,
        e.title AS title,
        e.description,
        e.event_date,
        e.club_id,
        e.venue_id,
        c.name AS club_name,
        v.name AS venue_name,
        v.capacity
      FROM events e
      LEFT JOIN clubs c ON e.club_id = c.id
      LEFT JOIN venues v ON e.venue_id = v.id
      ORDER BY e.event_date ASC
    `);

    const normalizedRows = Array.isArray(rows)
      ? rows.map((row) => ({
          event_id: row.event_id ?? 0,
          event_name: row.event_name ?? "",
          title: row.title ?? "",
          description: row.description ?? "",
          event_date: row.event_date ?? null,
          club_id: row.club_id ?? 0,
          venue_id: row.venue_id ?? 0,
          club_name: row.club_name ?? "Not assigned",
          venue_name: row.venue_name ?? "Not assigned",
          capacity: row.capacity ?? 0,
        }))
      : [];

    res.json(normalizedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create event
router.post('/', async (req, res) => {
    const { title, event_name, description, event_date, club_id, venue_id } = req.body;
    const normalizedTitle = (title ?? event_name ?? "").toString().trim();
    const normalizedDescription = (description ?? "").toString().trim();
    try {
        const [result] = await pool.query(
            'INSERT INTO events (title, description, event_date, club_id, venue_id) VALUES (?, ?, ?, ?, ?)',
            [
              normalizedTitle || "Untitled Event",
              normalizedDescription,
              event_date ?? null,
              club_id ?? null,
              venue_id ?? null
            ]
        );
        res.json({ id: result.insertId, message: 'Event created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
