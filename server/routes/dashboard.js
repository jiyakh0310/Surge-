// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', async (req, res) => {
    try {
        const [stats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM events) AS totalEvents,
                (SELECT COUNT(*) FROM participants) AS totalParticipants,
                (SELECT COUNT(*) FROM clubs) AS totalClubs,
                (SELECT COUNT(*) FROM venues) AS totalVenues,
                (SELECT COUNT(*) FROM sponsors) AS totalSponsors,
                (SELECT IFNULL(SUM(contribution_amount), 0) FROM sponsors) AS totalFunding,
                (SELECT IFNULL(SUM(budget_allocated), 0) FROM budget) AS totalBudget,
                (SELECT IFNULL(SUM(budget_remaining), 0) FROM budget) AS totalRemainingBudget
        `);
        
        // Get 5 most recent registrations
        const [recentRegistrations] = await db.execute(`
            SELECT p.name, p.email, e.title AS event_name, r.registration_date
            FROM registrations r
            JOIN participants p ON r.participant_id = p.id
            JOIN events e ON r.event_id = e.id
            ORDER BY r.registration_date DESC
            LIMIT 5
        `);

        // Get 5 upcoming events
        const [upcomingEvents] = await db.execute(`
            SELECT title AS event_name, event_date, id AS event_id
            FROM events
            WHERE event_date >= NOW()
            ORDER BY event_date ASC
            LIMIT 5
        `);

        res.json({
            ...stats[0],
            recentRegistrations,
            upcomingEvents
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
