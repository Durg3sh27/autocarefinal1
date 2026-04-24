const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [[vehicles]] = await pool.query(
      `SELECT COUNT(*) as total, SUM(odometer) as total_km FROM vehicles WHERE status = 'active'`
    );
    const [[maintenance]] = await pool.query(
      `SELECT COUNT(*) as total, SUM(cost) as total_spent FROM maintenance_records WHERE YEAR(service_date) = YEAR(NOW())`
    );
    const [[fuel]] = await pool.query(
      `SELECT COUNT(*) as total_fillups, SUM(total_cost) as total_spent, SUM(liters) as total_liters FROM fuel_logs WHERE YEAR(fill_date) = YEAR(NOW())`
    );
    const [[reminders]] = await pool.query(
      `SELECT COUNT(*) as total, SUM(CASE WHEN due_date < NOW() THEN 1 ELSE 0 END) as overdue FROM reminders WHERE status = 'pending'`
    );

    // Monthly maintenance costs (last 6 months)
    const [monthlyCosts] = await pool.query(`
      SELECT DATE_FORMAT(service_date, '%Y-%m') as month, SUM(cost) as total
      FROM maintenance_records
      WHERE service_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month
    `);

    // Service type breakdown
    const [serviceTypes] = await pool.query(`
      SELECT service_type, COUNT(*) as count, SUM(cost) as total_cost
      FROM maintenance_records
      GROUP BY service_type ORDER BY count DESC LIMIT 6
    `);

    res.json({
      vehicles: vehicles,
      maintenance: maintenance,
      fuel: fuel,
      reminders: reminders,
      monthly_costs: monthlyCosts,
      service_types: serviceTypes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats for a specific vehicle
router.get('/vehicle/:id', async (req, res) => {
  try {
    const [[vehicle]] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const [[maint]] = await pool.query(
      `SELECT COUNT(*) as total_services, SUM(cost) as total_spent, MAX(service_date) as last_service
       FROM maintenance_records WHERE vehicle_id = ?`, [req.params.id]
    );

    const [[fuel]] = await pool.query(
      `SELECT COUNT(*) as total_fillups, SUM(total_cost) as total_fuel_spent, SUM(liters) as total_liters
       FROM fuel_logs WHERE vehicle_id = ?`, [req.params.id]
    );

    const [recentServices] = await pool.query(
      `SELECT * FROM maintenance_records WHERE vehicle_id = ? ORDER BY service_date DESC LIMIT 5`,
      [req.params.id]
    );

    res.json({
      vehicle,
      maintenance: maint,
      fuel: fuel,
      recent_services: recentServices,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
