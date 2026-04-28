// server/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, "participant")',
            [username, email, password]
        );
        res.json({ success: true, userId: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already registered' });
        }
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute(
            'SELECT user_id, username, email, role FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/profile/:id
router.get('/profile/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        // Get user details
        const [userRows] = await db.execute(
            'SELECT user_id, username, email, role FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userRows[0];

        // Get registered events if user is a participant (matching by email)
        const [eventRows] = await db.execute(`
            SELECT
                e.id AS event_id,
                e.title AS event_name,
                e.event_date,
                v.name AS venue_name
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            LEFT JOIN venues v ON e.venue_id = v.id
            JOIN participants p ON r.participant_id = p.id
            WHERE p.email = ?
            ORDER BY r.registration_date DESC
        `, [user.email]);

        res.json({ user, events: eventRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
