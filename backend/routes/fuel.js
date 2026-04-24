const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET fuel logs (optionally filtered by vehicle)
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, limit = 50 } = req.query;
    let query = `
      SELECT f.*, v.make, v.model, v.year,
        LAG(f.odometer) OVER (PARTITION BY f.vehicle_id ORDER BY f.fill_date, f.id) as prev_odometer,
        LAG(f.liters) OVER (PARTITION BY f.vehicle_id ORDER BY f.fill_date, f.id) as prev_liters
      FROM fuel_logs f
      JOIN vehicles v ON f.vehicle_id = v.id
    `;
    const params = [];
    if (vehicle_id) {
      query += ' WHERE f.vehicle_id = ?';
      params.push(vehicle_id);
    }
    query += ' ORDER BY f.fill_date DESC LIMIT ?';
    params.push(parseInt(limit));
    const [rows] = await pool.query(query, params);

    // Calculate fuel efficiency
    const enriched = rows.map(row => {
      let efficiency = null;
      if (row.prev_odometer && row.prev_liters) {
        const distance = row.odometer - row.prev_odometer;
        if (distance > 0 && row.liters > 0) {
          efficiency = ((row.liters / distance) * 100).toFixed(2);
        }
      }
      return { ...row, efficiency_l_per_100km: efficiency };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET fuel stats for a vehicle
router.get('/stats/:vehicle_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as total_fillups,
        SUM(liters) as total_liters,
        SUM(total_cost) as total_spent,
        AVG(price_per_liter) as avg_price_per_liter,
        MIN(price_per_liter) as min_price,
        MAX(price_per_liter) as max_price,
        MAX(odometer) - MIN(odometer) as total_distance
       FROM fuel_logs WHERE vehicle_id = ?`,
      [req.params.vehicle_id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create fuel log
router.post('/', async (req, res) => {
  const { vehicle_id, fill_date, odometer, liters, price_per_liter, total_cost, station_name, fuel_type, full_tank, notes } = req.body;

  if (!vehicle_id || !fill_date || !odometer || !liters || !price_per_liter) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const calculatedTotal = total_cost || (liters * price_per_liter).toFixed(2);
    const [result] = await pool.query(
      `INSERT INTO fuel_logs (vehicle_id, fill_date, odometer, liters, price_per_liter, total_cost, station_name, fuel_type, full_tank, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicle_id, fill_date, odometer, liters, price_per_liter, calculatedTotal, station_name, fuel_type, full_tank !== false, notes]
    );

    // Update vehicle odometer
    await pool.query('UPDATE vehicles SET odometer = GREATEST(odometer, ?), updated_at = NOW() WHERE id = ?', [odometer, vehicle_id]);

    const [newLog] = await pool.query('SELECT * FROM fuel_logs WHERE id = ?', [result.insertId]);
    res.status(201).json(newLog[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE fuel log
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM fuel_logs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Fuel log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
