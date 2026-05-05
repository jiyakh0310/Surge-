// server/routes/clubs.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

let logoColumnCache = { checkedAt: 0, exists: true };
async function hasLogoUrlColumn() {
    const now = Date.now();
    if (now - logoColumnCache.checkedAt < 30_000) return logoColumnCache.exists;
    try {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS cnt
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'clubs'
               AND COLUMN_NAME = 'logo_url'`
        );
        logoColumnCache = { checkedAt: now, exists: Number(rows?.[0]?.cnt || 0) > 0 };
        return logoColumnCache.exists;
    } catch (_err) {
        // If we can't check (permissions/etc.), assume it exists to preserve current behavior.
        logoColumnCache = { checkedAt: now, exists: true };
        return true;
    }
}

// Get all clubs
router.get('/', async (req, res) => {
    try {
        const withLogo = await hasLogoUrlColumn();
        const [rows] = await pool.query(
            withLogo
                ? `
                    SELECT
                        id AS club_id,
                        name AS club_name,
                        name,
                        description,
                        logo_url
                    FROM clubs
                    ORDER BY name ASC
                `
                : `
                    SELECT
                        id AS club_id,
                        name AS club_name,
                        name,
                        description,
                        '' AS logo_url
                    FROM clubs
                    ORDER BY name ASC
                `
        );
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row) => ({
                club_id: row.club_id ?? 0,
                club_name: row.club_name ?? "Unnamed Club",
                name: row.name ?? "Unnamed Club",
                description: row.description ?? "",
                logo_url: row.logo_url ?? ""
            }))
            : [];
        res.json(normalizedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create club
router.post('/', async (req, res) => {
    const { name, club_name, description, logo_url } = req.body;
    const normalizedName = (name ?? club_name ?? "").toString().trim();
    const normalizedDescription = (description ?? "").toString().trim();
    const normalizedLogo = (logo_url ?? "").toString().trim();
    try {
        const withLogo = await hasLogoUrlColumn();
        const [result] = await pool.query(
            withLogo
                ? 'INSERT INTO clubs (name, description, logo_url) VALUES (?, ?, ?)'
                : 'INSERT INTO clubs (name, description) VALUES (?, ?)',
            withLogo
                ? [normalizedName || "Unnamed Club", normalizedDescription, normalizedLogo || null]
                : [normalizedName || "Unnamed Club", normalizedDescription]
        );
        res.json({ id: result.insertId, message: 'Club created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update club
router.put('/:id', async (req, res) => {
    const { name, club_name, description, logo_url } = req.body;
    const normalizedName = (name ?? club_name ?? "").toString().trim();
    const normalizedDescription = (description ?? "").toString().trim();
    const normalizedLogo = (logo_url ?? "").toString().trim();
    try {
        const withLogo = await hasLogoUrlColumn();
        await pool.query(
            withLogo
                ? 'UPDATE clubs SET name = ?, description = ?, logo_url = ? WHERE id = ?'
                : 'UPDATE clubs SET name = ?, description = ? WHERE id = ?',
            withLogo
                ? [normalizedName || "Unnamed Club", normalizedDescription, normalizedLogo || null, req.params.id]
                : [normalizedName || "Unnamed Club", normalizedDescription, req.params.id]
        );
        res.json({ message: 'Club updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete club
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM clubs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Club deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Join club (participant)
router.post('/join', async (req, res) => {
    const user_id = Number(req.body.user_id);
    const club_id = Number(req.body.club_id);
    if (!Number.isFinite(user_id) || !Number.isFinite(club_id)) {
        return res.status(400).json({ error: 'user_id and club_id are required' });
    }
    try {
        // Enforce max 3 clubs
        const [existing] = await pool.query(
            'SELECT COUNT(*) AS cnt FROM participant_clubs WHERE user_id = ?',
            [user_id]
        );
        if (existing[0].cnt >= 3) {
            return res.status(400).json({ error: 'You can join up to 3 clubs only.' });
        }
        await pool.query(
            'INSERT INTO participant_clubs (user_id, club_id) VALUES (?, ?)',
            [user_id, club_id]
        );
        res.json({ message: 'Joined club successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Already joined this club.' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Get clubs joined by a user
router.get('/my/:userId', async (req, res) => {
    try {
        const withLogo = await hasLogoUrlColumn();
        const [rows] = await pool.query(
            withLogo
                ? `
                    SELECT c.id AS club_id, c.name AS club_name, c.description, c.logo_url, pc.joined_at
                    FROM participant_clubs pc
                    JOIN clubs c ON pc.club_id = c.id
                    WHERE pc.user_id = ?
                    ORDER BY pc.joined_at DESC
                `
                : `
                    SELECT c.id AS club_id, c.name AS club_name, c.description, '' AS logo_url, pc.joined_at
                    FROM participant_clubs pc
                    JOIN clubs c ON pc.club_id = c.id
                    WHERE pc.user_id = ?
                    ORDER BY pc.joined_at DESC
                `,
            [req.params.userId]
        );
        res.json(Array.isArray(rows) ? rows : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Leave club — DELETE /api/clubs/leave/:userId/:clubId
router.delete('/leave/:userId/:clubId', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM participant_clubs WHERE user_id = ? AND club_id = ?',
            [req.params.userId, req.params.clubId]
        );
        res.json({ message: 'Left club successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
