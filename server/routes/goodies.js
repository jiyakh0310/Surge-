const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all goodies
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                g.goodie_id,
                g.goodie_name,
                s.sponsor_name,
                e.title AS event_name,
                COALESCE(gd.status, 'pending') AS status
            FROM goodies g
            LEFT JOIN sponsors s ON g.sponsor_id = s.sponsor_id
            LEFT JOIN events e ON g.event_id = e.id
            LEFT JOIN goodie_distribution gd ON gd.goodie_id = g.goodie_id
            ORDER BY g.goodie_id DESC
        `);
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row) => ({
                goodie_id: row.goodie_id ?? 0,
                goodie_name: row.goodie_name ?? 'Unnamed Goodie',
                sponsor_name: row.sponsor_name ?? 'Unnamed Sponsor',
                event_name: row.event_name ?? 'Untitled Event',
                status: row.status ?? 'pending'
            }))
            : [];
        res.json(normalizedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add goodie
router.post('/', async (req, res) => {
    const { goodie_name, sponsor_id, event_id, committee_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO goodies (goodie_name, sponsor_id, event_id, committee_id) VALUES (?, ?, ?, ?)',
            [
                (goodie_name ?? '').toString().trim() || 'Unnamed Goodie',
                sponsor_id ?? null,
                event_id ?? null,
                committee_id ?? null
            ]
        );
        res.json({ id: result.insertId, message: 'Goodie added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get distribution status
router.get('/distribution', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                gd.distribution_id,
                gd.participant_id,
                gd.goodie_id,
                gd.status,
                p.name AS participant_name,
                g.goodie_name
            FROM goodie_distribution gd
            JOIN participants p ON gd.participant_id = p.id
            JOIN goodies g ON gd.goodie_id = g.goodie_id
            ORDER BY gd.distribution_id DESC
        `);
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row) => ({
                distribution_id: row.distribution_id ?? 0,
                participant_id: row.participant_id ?? 0,
                goodie_id: row.goodie_id ?? 0,
                status: row.status ?? 'pending',
                participant_name: row.participant_name ?? 'No data',
                goodie_name: row.goodie_name ?? 'Unnamed Goodie'
            }))
            : [];
        res.json(normalizedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete goodie
router.delete('/:goodie_id', async (req, res) => {
    try {
        await pool.query('DELETE FROM goodies WHERE goodie_id = ?', [req.params.goodie_id]);
        res.json({ message: 'Goodie deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
