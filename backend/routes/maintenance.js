const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET all maintenance records (optionally filtered by vehicle)
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, limit = 50 } = req.query;
    let query = `
      SELECT m.*, v.make, v.model, v.year
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
    `;
    const params = [];
    if (vehicle_id) {
      query += ' WHERE m.vehicle_id = ?';
      params.push(vehicle_id);
    }
    query += ' ORDER BY m.service_date DESC LIMIT ?';
    params.push(parseInt(limit));
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single record
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, v.make, v.model, v.year FROM maintenance_records m
       JOIN vehicles v ON m.vehicle_id = v.id WHERE m.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create maintenance record
router.post('/', async (req, res) => {
  const {
    vehicle_id, service_type, description, cost, odometer,
    service_date, shop_name, technician, parts_used,
    next_service_date, next_service_odometer, status
  } = req.body;

  if (!vehicle_id || !service_type || !service_date) {
    return res.status(400).json({ error: 'vehicle_id, service_type, and service_date are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO maintenance_records 
       (vehicle_id, service_type, description, cost, odometer, service_date, shop_name, technician, parts_used, next_service_date, next_service_odometer, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicle_id, service_type, description, cost || 0, odometer, service_date, shop_name, technician, parts_used, next_service_date || null, next_service_odometer || null, status || 'completed']
    );

    // Update vehicle odometer if provided
    if (odometer) {
      await pool.query('UPDATE vehicles SET odometer = GREATEST(odometer, ?), updated_at = NOW() WHERE id = ?', [odometer, vehicle_id]);
    }

    const [newRecord] = await pool.query('SELECT * FROM maintenance_records WHERE id = ?', [result.insertId]);
    res.status(201).json(newRecord[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update record
router.put('/:id', async (req, res) => {
  const {
    service_type, description, cost, odometer,
    service_date, shop_name, technician, parts_used,
    next_service_date, next_service_odometer, status
  } = req.body;
  try {
    await pool.query(
      `UPDATE maintenance_records SET service_type=?, description=?, cost=?, odometer=?,
       service_date=?, shop_name=?, technician=?, parts_used=?, next_service_date=?, next_service_odometer=?, status=?
       WHERE id=?`,
      [service_type, description, cost, odometer, service_date, shop_name, technician, parts_used, next_service_date, next_service_odometer, status, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM maintenance_records WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE record
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM maintenance_records WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
