// server/routes/events.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

function parseNullableInt(value) {
  if (value === '' || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Normalize datetime-local / ISO strings for MySQL DATETIME */
function normalizeEventDate(value) {
  if (value === undefined || value === null || value === '') return null;
  let s = String(value).trim().replace('T', ' ');
  if (!s) return null;
  s = s.replace(/\.\d{3}$/, '').replace(/Z$/, '');
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) return `${s}:00`;
  return s.length > 19 ? s.slice(0, 19) : s;
}

let logoColumnCache = { checkedAt: 0, exists: true };
async function hasLogoUrlColumn() {
  const now = Date.now();
  if (now - logoColumnCache.checkedAt < 30_000) return logoColumnCache.exists;
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'clubs'
         AND COLUMN_NAME = 'logo_url'`
    );
    logoColumnCache = { checkedAt: now, exists: Number(rows?.[0]?.cnt || 0) > 0 };
    return logoColumnCache.exists;
  } catch (_err) {
    // If we can't check, assume it exists to preserve current behavior.
    logoColumnCache = { checkedAt: now, exists: true };
    return true;
  }
}

// Get all events with club and venue names
router.get("/", async (req, res) => {
  try {
    const withLogo = await hasLogoUrlColumn();
    const [rows] = await pool.query(
      withLogo
        ? `
          SELECT 
            e.id AS event_id,
            e.id AS id,
            e.title AS event_name,
            e.title AS title,
            e.description,
            e.event_date,
            e.club_id,
            e.venue_id,
            c.name AS club_name,
            c.logo_url AS club_logo_url,
            v.name AS venue_name,
            v.capacity
          FROM events e
          LEFT JOIN clubs c ON e.club_id = c.id
          LEFT JOIN venues v ON e.venue_id = v.id
          ORDER BY e.event_date ASC
        `
        : `
          SELECT 
            e.id AS event_id,
            e.id AS id,
            e.title AS event_name,
            e.title AS title,
            e.description,
            e.event_date,
            e.club_id,
            e.venue_id,
            c.name AS club_name,
            '' AS club_logo_url,
            v.name AS venue_name,
            v.capacity
          FROM events e
          LEFT JOIN clubs c ON e.club_id = c.id
          LEFT JOIN venues v ON e.venue_id = v.id
          ORDER BY e.event_date ASC
        `
    );

    const normalizedRows = Array.isArray(rows)
      ? rows.map((row) => ({
          event_id: row.event_id ?? 0,
          id: row.id ?? row.event_id ?? 0,
          event_name: row.event_name ?? "",
          title: row.title ?? "",
          description: row.description ?? "",
          event_date: row.event_date ?? null,
          club_id: row.club_id ?? null,
          venue_id: row.venue_id ?? null,
          club_name: row.club_name ?? "General",
          club_logo_url: row.club_logo_url ?? "",
          venue_name: row.venue_name ?? "TBA",
          capacity: row.capacity ?? 0,
        }))
      : [];

    // Must ALWAYS return an array
    res.json(normalizedRows);
  } catch (err) {
    // Must ALWAYS return an array (even on SQL errors)
    res.json([]);
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
              normalizeEventDate(event_date),
              parseNullableInt(club_id),
              parseNullableInt(venue_id)
            ]
        );
        res.json({ success: true, message: "Event added successfully", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update event
router.put('/:id', async (req, res) => {
    const { title, event_name, description, event_date, club_id, venue_id } = req.body;
    const normalizedTitle = (title ?? event_name ?? "").toString().trim();
    const normalizedDescription = (description ?? "").toString().trim();
    try {
        await pool.query(
            'UPDATE events SET title = ?, description = ?, event_date = ?, club_id = ?, venue_id = ? WHERE id = ?',
            [
              normalizedTitle || "Untitled Event",
              normalizedDescription,
              normalizeEventDate(event_date),
              parseNullableInt(club_id),
              parseNullableInt(venue_id),
              req.params.id
            ]
        );
        res.json({ success: true, message: 'Event updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
  const eventId = Number(req.params.id);
  if (!Number.isFinite(eventId)) return res.status(400).json({ error: 'Invalid event id' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Delete dependents first to avoid FK issues (tables exist in upgrade.sql)
    await conn.query('DELETE FROM registrations WHERE event_id = ?', [eventId]).catch(() => {});
    await conn.query('DELETE FROM budget WHERE event_id = ?', [eventId]).catch(() => {});
    await conn.query('DELETE FROM expenses WHERE event_id = ?', [eventId]).catch(() => {});
    await conn.query('DELETE FROM goodies WHERE event_id = ?', [eventId]).catch(() => {});
    await conn.query('DELETE FROM sponsors WHERE event_id = ?', [eventId]).catch(() => {});

    const [result] = await conn.query('DELETE FROM events WHERE id = ?', [eventId]);
    await conn.commit();
    res.json({ success: true, message: 'Event deleted', affectedRows: result?.affectedRows ?? 0 });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
