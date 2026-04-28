// server/routes/clubs.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                id AS club_id,
                name AS club_name,
                name,
                description
            FROM clubs
            ORDER BY name ASC
        `);
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row) => ({
                club_id: row.club_id ?? 0,
                club_name: row.club_name ?? "Unnamed Club",
                name: row.name ?? "Unnamed Club",
                description: row.description ?? ""
            }))
            : [];
        res.json(normalizedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { name, club_name, description } = req.body;
    const normalizedName = (name ?? club_name ?? "").toString().trim();
    const normalizedDescription = (description ?? "").toString().trim();
    try {
        const [result] = await pool.query(
            'INSERT INTO clubs (name, description) VALUES (?, ?)',
            [normalizedName || "Unnamed Club", normalizedDescription]
        );
        res.json({ id: result.insertId, message: 'Club created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
