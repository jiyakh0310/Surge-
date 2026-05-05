// server/routes/venues.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                id AS venue_id,
                name AS venue_name,
                name,
                capacity,
                venue_timings,
                poc_name,
                poc_contact
            FROM venues
            ORDER BY name ASC
        `);
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row) => ({
                venue_id: row.venue_id ?? 0,
                venue_name: row.venue_name ?? "Unnamed Venue",
                name: row.name ?? "Unnamed Venue",
                capacity: row.capacity ?? 0,
                venue_timings: row.venue_timings ?? "Not assigned",
                poc_name: row.poc_name ?? "Not assigned",
                poc_contact: row.poc_contact ?? "Not assigned"
            }))
            : [];
        res.json(normalizedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { name, venue_name, capacity, venue_timings, poc_name, poc_contact } = req.body;
    const normalizedName = (name ?? venue_name ?? "").toString().trim();
    const normalizedTimings = (venue_timings ?? "").toString().trim();
    const normalizedPocName = (poc_name ?? "").toString().trim();
    const normalizedPocContact = (poc_contact ?? "").toString().trim();
    const normalizedCapacity = Number.isFinite(Number(capacity)) ? Number(capacity) : 0;

    try {
        const [result] = await pool.query(
            'INSERT INTO venues (name, capacity, venue_timings, poc_name, poc_contact) VALUES (?, ?, ?, ?, ?)',
            [
                normalizedName || "Unnamed Venue",
                normalizedCapacity,
                normalizedTimings || "Not assigned",
                normalizedPocName || "Not assigned",
                normalizedPocContact || "Not assigned"
            ]
        );
        res.json({ id: result.insertId, message: 'Venue created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update venue
router.put('/:id', async (req, res) => {
    const { name, venue_name, capacity, venue_timings, poc_name, poc_contact } = req.body;
    const normalizedName = (name ?? venue_name ?? "").toString().trim();
    const normalizedTimings = (venue_timings ?? "").toString().trim();
    const normalizedPocName = (poc_name ?? "").toString().trim();
    const normalizedPocContact = (poc_contact ?? "").toString().trim();
    const normalizedCapacity = Number.isFinite(Number(capacity)) ? Number(capacity) : 0;
    try {
        await pool.query(
            'UPDATE venues SET name = ?, capacity = ?, venue_timings = ?, poc_name = ?, poc_contact = ? WHERE id = ?',
            [
                normalizedName || "Unnamed Venue",
                normalizedCapacity,
                normalizedTimings || "Not assigned",
                normalizedPocName || "Not assigned",
                normalizedPocContact || "Not assigned",
                req.params.id
            ]
        );
        res.json({ message: 'Venue updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete venue
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM venues WHERE id = ?', [req.params.id]);
        res.json({ message: 'Venue deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
