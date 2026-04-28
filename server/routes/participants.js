const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all participants with event titles
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                p.id AS participant_id,
                p.name,
                p.email,
                p.phone,
                p.college,
                e.title AS event_name
            FROM participants p
            LEFT JOIN registrations r ON p.id = r.participant_id
            LEFT JOIN events e ON r.event_id = e.id
            ORDER BY r.registration_date DESC
            LIMIT 50
        `);
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row) => ({
                participant_id: row.participant_id ?? 0,
                name: row.name ?? 'No data',
                email: row.email ?? 'No data',
                phone: row.phone ?? 'No data',
                college: row.college ?? 'No data',
                event_name: row.event_name ?? 'Untitled Event'
            }))
            : [];
        res.json(normalizedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
  const { name, email, phone, college, event_id } = req.body;

  try {
    let participantId;

    const [existing] = await db.query(
      "SELECT id FROM participants WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      participantId = existing[0].id;
    } else {
      const [result] = await db.query(
        "INSERT INTO participants (name, email, phone, college, event_id) VALUES (?, ?, ?, ?, ?)",
        [name, email, phone, college, event_id]
      );
      participantId = result.insertId;
    }

    await db.query(
      "INSERT INTO registrations (participant_id, event_id, registration_date, status) VALUES (?, ?, CURDATE(), ?)",
      [participantId, event_id, "Confirmed"]
    );

    res.json({ success: true, message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;