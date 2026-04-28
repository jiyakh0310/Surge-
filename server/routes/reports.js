// server/routes/reports.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Event-wise participant count
router.get('/event-attendance', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                e.id AS event_id,
                e.title AS event_name,
                COUNT(r.registration_id) AS attendance
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            GROUP BY e.id, e.title
            ORDER BY attendance DESC
        `);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Sponsor Contribution Report
router.get('/sponsor-contributions', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT sponsor_name, SUM(contribution_amount) as total_contribution
            FROM sponsors
            GROUP BY sponsor_name
            HAVING total_contribution > 0
            ORDER BY total_contribution DESC
        `);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Budget Allocated vs Remaining
router.get('/budget-status', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                b.budget_id,
                b.event_id,
                e.title AS event_name,
                b.budget_allocated,
                b.budget_remaining
            FROM budget b
            LEFT JOIN events e ON b.event_id = e.id
        `);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Venue Allocation Report
router.get('/venue-usage', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                v.id AS venue_id,
                v.name AS venue_name,
                COUNT(e.id) AS events_hosted
            FROM venues v
            LEFT JOIN events e ON v.id = e.venue_id
            GROUP BY v.id, v.name
        `);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Goodie Distribution Report
router.get('/goodies-status', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT g.goodie_name, gd.status, COUNT(gd.distribution_id) as count
            FROM goodies g
            LEFT JOIN goodie_distribution gd ON g.goodie_id = gd.goodie_id
            GROUP BY g.goodie_id, gd.status
        `);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
