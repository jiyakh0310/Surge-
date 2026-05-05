const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get budget status for all events
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                b.budget_id,
                b.event_id,
                e.title AS event_name,
                b.budget_allocated,
                b.budget_remaining
            FROM budget b
            LEFT JOIN events e ON b.event_id = e.id
            ORDER BY b.budget_id DESC
        `);
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row) => ({
                budget_id: row.budget_id ?? 0,
                event_id: row.event_id ?? 0,
                event_name: row.event_name ?? 'Untitled Event',
                budget_allocated: row.budget_allocated ?? 0,
                budget_remaining: row.budget_remaining ?? 0
            }))
            : [];
        res.json(normalizedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all expenses (or by event)
router.get('/expenses/:eventId?', async (req, res) => {
    try {
        let rows;
        if (req.params.eventId) {
            [rows] = await pool.query(`
                SELECT
                    ex.expense_id,
                    ex.event_id,
                    e.title AS event_name,
                    ex.amount,
                    ex.expense_type,
                    ex.description,
                    ex.expense_date
                FROM expenses ex
                LEFT JOIN events e ON ex.event_id = e.id
                WHERE ex.event_id = ?
                ORDER BY ex.expense_date DESC, ex.expense_id DESC
            `, [req.params.eventId]);
        } else {
            [rows] = await pool.query(`
                SELECT
                    ex.expense_id,
                    ex.event_id,
                    e.title AS event_name,
                    ex.amount,
                    ex.expense_type,
                    ex.description,
                    ex.expense_date
                FROM expenses ex
                LEFT JOIN events e ON ex.event_id = e.id
                ORDER BY ex.expense_date DESC, ex.expense_id DESC
            `);
        }
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row) => ({
                expense_id: row.expense_id ?? 0,
                event_id: row.event_id ?? 0,
                event_name: row.event_name ?? 'Untitled Event',
                amount: row.amount ?? 0,
                expense_type: row.expense_type ?? 'General',
                description: row.description ?? '',
                expense_date: row.expense_date ?? null
            }))
            : [];
        res.json(normalizedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add budget for an event
router.post('/', async (req, res) => {
    const { event_id, budget_allocated } = req.body;
    const normalizedBudget = Number.isFinite(Number(budget_allocated)) ? Number(budget_allocated) : 0;
    try {
        const [existingRows] = await pool.query('SELECT budget_id, budget_allocated, budget_remaining FROM budget WHERE event_id = ? LIMIT 1', [event_id]);
        if (Array.isArray(existingRows) && existingRows.length > 0) {
            const existing = existingRows[0];
            const spentAmount = Math.max(0, Number(existing.budget_allocated || 0) - Number(existing.budget_remaining || 0));
            const nextRemaining = Math.max(0, normalizedBudget - spentAmount);
            await pool.query(
                'UPDATE budget SET budget_allocated = ?, budget_remaining = ? WHERE budget_id = ?',
                [normalizedBudget, nextRemaining, existing.budget_id]
            );
        } else {
            await pool.query(
                'INSERT INTO budget (event_id, budget_allocated, budget_remaining) VALUES (?, ?, ?)',
                [event_id, normalizedBudget, normalizedBudget]
            );
        }
        res.json({ message: 'Budget saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update budget
router.put('/:budget_id', async (req, res) => {
    const { event_id, budget_allocated, budget_remaining } = req.body;
    const normalizedAllocated = Number.isFinite(Number(budget_allocated)) ? Number(budget_allocated) : 0;
    try {
        let normalizedRemaining;
        if (budget_remaining !== undefined && budget_remaining !== null && budget_remaining !== '') {
            normalizedRemaining = Number.isFinite(Number(budget_remaining)) ? Number(budget_remaining) : normalizedAllocated;
        } else {
            const [prevRows] = await pool.query(
                'SELECT budget_allocated, budget_remaining FROM budget WHERE budget_id = ? LIMIT 1',
                [req.params.budget_id]
            );
            if (Array.isArray(prevRows) && prevRows.length > 0) {
                const spent = Math.max(
                    0,
                    Number(prevRows[0].budget_allocated || 0) - Number(prevRows[0].budget_remaining || 0)
                );
                normalizedRemaining = Math.max(0, normalizedAllocated - spent);
            } else {
                normalizedRemaining = normalizedAllocated;
            }
        }

        await pool.query(
            'UPDATE budget SET event_id = ?, budget_allocated = ?, budget_remaining = ? WHERE budget_id = ?',
            [event_id ?? null, normalizedAllocated, normalizedRemaining, req.params.budget_id]
        );
        res.json({ message: 'Budget updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete budget
router.delete('/:budget_id', async (req, res) => {
    try {
        await pool.query('DELETE FROM budget WHERE budget_id = ?', [req.params.budget_id]);
        res.json({ message: 'Budget deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
