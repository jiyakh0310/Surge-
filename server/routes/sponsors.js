const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all sponsors
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                s.sponsor_id,
                s.sponsor_name,
                s.contact_no,
                s.event_id,
                e.title AS event_name,
                s.contribution_amount
            FROM sponsors s
            LEFT JOIN events e ON s.event_id = e.id
            ORDER BY s.sponsor_id DESC
        `);
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row) => ({
                sponsor_id: row.sponsor_id ?? 0,
                sponsor_name: row.sponsor_name ?? 'Unnamed Sponsor',
                contact_no: row.contact_no ?? 'Not assigned',
                event_id: row.event_id ?? null,
                event_name: row.event_name ?? 'Untitled Event',
                contribution_amount: row.contribution_amount ?? 0
            }))
            : [];
        res.json(normalizedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add sponsor
router.post('/', async (req, res) => {
    const { sponsor_name, contact_no, event_id, contribution_amount } = req.body;
    const normalizedName = (sponsor_name ?? '').toString().trim() || 'Unnamed Sponsor';
    const normalizedContact = (contact_no ?? '').toString().trim() || 'Not assigned';
    const normalizedContribution = Number.isFinite(Number(contribution_amount)) ? Number(contribution_amount) : 0;
    try {
        const [result] = await pool.query(
            'INSERT INTO sponsors (sponsor_name, contact_no, event_id, contribution_amount) VALUES (?, ?, ?, ?)',
            [normalizedName, normalizedContact, event_id ?? null, normalizedContribution]
        );
        res.json({ id: result.insertId, message: 'Sponsor added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete sponsor
router.delete('/:sponsor_id', async (req, res) => {
    try {
        await pool.query('DELETE FROM sponsors WHERE sponsor_id = ?', [req.params.sponsor_id]);
        res.json({ message: 'Sponsor deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
