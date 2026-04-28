const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (_req, res) => {
    try {
        const [rows] = await pool.query(`
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

router.post('/', async (req, res) => {
    const { event_id, amount, expense_type, description, expense_date } = req.body;
    const normalizedAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [expenseResult] = await connection.query(
            'INSERT INTO expenses (event_id, amount, expense_type, description, expense_date) VALUES (?, ?, ?, ?, ?)',
            [
                event_id ?? null,
                normalizedAmount,
                (expense_type ?? '').toString().trim() || 'General',
                (description ?? '').toString().trim(),
                expense_date ?? null
            ]
        );

        const [budgetRows] = await connection.query(
            'SELECT budget_id, budget_remaining FROM budget WHERE event_id = ? LIMIT 1',
            [event_id]
        );

        if (Array.isArray(budgetRows) && budgetRows.length > 0) {
            await connection.query(
                'UPDATE budget SET budget_remaining = GREATEST(0, budget_remaining - ?) WHERE budget_id = ?',
                [normalizedAmount, budgetRows[0].budget_id]
            );
        } else {
            await connection.query(
                'INSERT INTO budget (event_id, budget_allocated, budget_remaining) VALUES (?, ?, ?)',
                [event_id, normalizedAmount, 0]
            );
        }

        await connection.commit();
        res.json({ id: expenseResult.insertId, message: 'Expense saved' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
