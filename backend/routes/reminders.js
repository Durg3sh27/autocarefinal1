const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET all reminders
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, status } = req.query;
    let query = `
      SELECT r.*, v.make, v.model, v.year, v.odometer as current_odometer
      FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    if (vehicle_id) { query += ' AND r.vehicle_id = ?'; params.push(vehicle_id); }
    if (status) { query += ' AND r.status = ?'; params.push(status); }
    query += ' ORDER BY FIELD(r.priority,"critical","high","medium","low"), r.due_date ASC';
    const [rows] = await pool.query(query, params);

    // Add overdue flag
    const today = new Date();
    const enriched = rows.map(r => ({
      ...r,
      is_overdue: r.due_date && new Date(r.due_date) < today && r.status === 'pending',
      days_until_due: r.due_date
        ? Math.ceil((new Date(r.due_date) - today) / (1000 * 60 * 60 * 24))
        : null,
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create reminder
router.post('/', async (req, res) => {
  const { vehicle_id, title, description, due_date, due_odometer, priority } = req.body;
  if (!vehicle_id || !title) return res.status(400).json({ error: 'vehicle_id and title required' });
  try {
    const [result] = await pool.query(
      `INSERT INTO reminders (vehicle_id, title, description, due_date, due_odometer, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vehicle_id, title, description, due_date || null, due_odometer || null, priority || 'medium']
    );
    const [newReminder] = await pool.query('SELECT * FROM reminders WHERE id = ?', [result.insertId]);
    res.status(201).json(newReminder[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'dismissed', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    await pool.query('UPDATE reminders SET status = ? WHERE id = ?', [status, req.params.id]);
    const [updated] = await pool.query('SELECT * FROM reminders WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE reminder
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reminders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
