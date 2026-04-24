require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { testConnection } = require('./db/connection');

const authRouter        = require('./routes/auth');
const vehiclesRouter    = require('./routes/vehicles');
const maintenanceRouter = require('./routes/maintenance');
const fuelRouter        = require('./routes/fuel');
const remindersRouter   = require('./routes/reminders');
const statsRouter       = require('./routes/stats');
const authMiddleware    = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Public
app.use('/api/auth', authRouter);
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'GarageIQ API' })
);

// Protected
app.use('/api/vehicles',    authMiddleware, vehiclesRouter);
app.use('/api/maintenance', authMiddleware, maintenanceRouter);
app.use('/api/fuel',        authMiddleware, fuelRouter);
app.use('/api/reminders',   authMiddleware, remindersRouter);
app.use('/api/stats',       authMiddleware, statsRouter);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

async function start() {
  await testConnection();
  app.listen(PORT, () => console.log(`🚗 GarageIQ API → http://localhost:${PORT}`));
}
start();
