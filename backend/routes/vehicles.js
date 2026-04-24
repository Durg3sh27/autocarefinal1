const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, 
        (SELECT COUNT(*) FROM maintenance_records m WHERE m.vehicle_id = v.id) as service_count,
        (SELECT MAX(service_date) FROM maintenance_records m WHERE m.vehicle_id = v.id) as last_service_date,
        (SELECT COUNT(*) FROM reminders r WHERE r.vehicle_id = v.id AND r.status = 'pending') as pending_reminders
       FROM vehicles v WHERE v.status != 'sold' ORDER BY v.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single vehicle
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create vehicle
router.post('/', async (req, res) => {
  const { make, model, year, license_plate, vin, color, odometer, fuel_type, notes } = req.body;
  if (!make || !model || !year) {
    return res.status(400).json({ error: 'make, model, and year are required' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO vehicles (make, model, year, license_plate, vin, color, odometer, fuel_type, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [make, model, year, license_plate || null, vin || null, color || null, odometer || 0, fuel_type || 'gasoline', notes || null]
    );
    const [newVehicle] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [result.insertId]);
    res.status(201).json(newVehicle[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update vehicle
router.put('/:id', async (req, res) => {
  const { make, model, year, license_plate, vin, color, odometer, fuel_type, status, notes } = req.body;
  try {
    await pool.query(
      `UPDATE vehicles SET make=?, model=?, year=?, license_plate=?, vin=?, color=?, odometer=?, fuel_type=?, status=?, notes=?, updated_at=NOW()
       WHERE id=?`,
      [make, model, year, license_plate, vin, color, odometer, fuel_type, status, notes, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
