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

        if (user.role === 'organizer') {
            // Get organizer stats
            const [stats] = await db.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM events) AS totalEvents,
                    (SELECT COUNT(*) FROM participants) AS totalParticipants,
                    (SELECT COUNT(*) FROM sponsors) AS totalSponsors,
                    (SELECT IFNULL(SUM(budget_allocated), 0) FROM budget) AS totalBudget
            `);
            return res.json({ user, stats: stats[0], events: [], clubs: [] });
        }

        // Participant: Get registered events (matching by email)
        const [eventRows] = await db.execute(`
            SELECT
                e.id AS event_id,
                e.title AS event_name,
                e.event_date,
                v.name AS venue_name,
                r.status
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            LEFT JOIN venues v ON e.venue_id = v.id
            JOIN participants p ON r.participant_id = p.id
            WHERE p.email = ?
            ORDER BY r.registration_date DESC
        `, [user.email]);

        // Participant: Get joined clubs
        const [clubRows] = await db.execute(`
            SELECT c.id AS club_id, c.name AS club_name, c.description, c.logo_url, pc.joined_at
            FROM participant_clubs pc
            JOIN clubs c ON pc.club_id = c.id
            WHERE pc.user_id = ?
            ORDER BY pc.joined_at DESC
        `, [userId]);

        res.json({ user, events: eventRows, clubs: clubRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
