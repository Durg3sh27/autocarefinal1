# 🚗 GarageIQ — Vehicle Maintenance Tracker

A full-stack vehicle maintenance management system built with **React**, **Node.js/Express**, and **MySQL**.

---

## ✨ Features

- **Multi-Vehicle Fleet Management** — Add and manage any number of vehicles
- **Service Log** — Track all maintenance records with cost, odometer, shop details, and next service scheduling
- **Fuel Log** — Log every fill-up with automatic fuel efficiency (L/100km) calculation and price trend charts
- **Smart Reminders** — Date-based and odometer-based reminders with priority levels and overdue alerts
- **Analytics Dashboard** — Monthly cost charts, service type breakdown, and fleet KPIs
- **Industrial Dark UI** — Custom-designed dark theme with Bebas Neue + JetBrains Mono typography

---

## 🛠 Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React 18, React Router, Recharts, Axios, Lucide Icons |
| Backend   | Node.js, Express 4, morgan, cors   |
| Database  | MySQL 8, mysql2/promise            |
| DevOps    | Docker, Docker Compose             |

---

## 🚀 Quick Start

### Option A — Docker Compose (Recommended)

```bash
# Clone / unzip the project
cd garageiq

# Start everything (MySQL + Backend + Frontend)
docker-compose up --build

# App will be available at:
# Frontend → http://localhost:3000
# Backend API → http://localhost:5000/api
```

The database is automatically seeded with 3 sample vehicles, maintenance records, fuel logs, and reminders.

---

### Option B — Manual Setup

#### 1. MySQL
```bash
mysql -u root -p < backend/db/schema.sql
```

#### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev     # Development with nodemon
# or
npm start       # Production
```

#### 3. Frontend
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

---

## 📁 Project Structure

```
garageiq/
├── backend/
│   ├── db/
│   │   ├── connection.js      # MySQL pool
│   │   └── schema.sql         # Tables + seed data
│   ├── routes/
│   │   ├── vehicles.js        # CRUD for vehicles
│   │   ├── maintenance.js     # Service records
│   │   ├── fuel.js            # Fuel logs + efficiency calc
│   │   ├── reminders.js       # Reminders + overdue logic
│   │   └── stats.js           # Dashboard aggregations
│   ├── server.js              # Express app entry
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.js   # KPIs + charts
│       │   ├── Vehicles.js    # Fleet grid view
│       │   ├── Maintenance.js # Service log table
│       │   ├── FuelLog.js     # Fuel entries + trend chart
│       │   └── Reminders.js   # Reminder cards with actions
│       ├── components/
│       │   ├── Sidebar.js     # Nav with badge
│       │   └── Modal.js       # Reusable modal
│       ├── utils/api.js       # Axios API client
│       ├── App.js
│       ├── index.js
│       └── index.css          # Full design system
└── docker-compose.yml
```

---

## 🔌 API Endpoints

### Vehicles
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/vehicles` | List all vehicles with stats |
| GET | `/api/vehicles/:id` | Get single vehicle |
| POST | `/api/vehicles` | Create vehicle |
| PUT | `/api/vehicles/:id` | Update vehicle |
| DELETE | `/api/vehicles/:id` | Delete vehicle + cascade |

### Maintenance
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/maintenance?vehicle_id=X` | List records (filterable) |
| POST | `/api/maintenance` | Create record |
| PUT | `/api/maintenance/:id` | Update record |
| DELETE | `/api/maintenance/:id` | Delete record |

### Fuel
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/fuel?vehicle_id=X` | List fuel logs with efficiency |
| GET | `/api/fuel/stats/:vehicle_id` | Fuel stats for vehicle |
| POST | `/api/fuel` | Add fuel entry |
| DELETE | `/api/fuel/:id` | Delete entry |

### Reminders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reminders?status=pending` | List reminders |
| POST | `/api/reminders` | Create reminder |
| PATCH | `/api/reminders/:id/status` | Update status |
| DELETE | `/api/reminders/:id` | Delete |

### Stats
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stats/dashboard` | Full dashboard aggregation |
| GET | `/api/stats/vehicle/:id` | Per-vehicle stats |

---

## ⚙️ Environment Variables

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=garageiq123
DB_NAME=garageiq
FRONTEND_URL=http://localhost:3000
```

---

## 📊 Database Schema

```
vehicles          → make, model, year, license_plate, vin, color, odometer, fuel_type
maintenance_records → vehicle_id, service_type, cost, odometer, service_date, shop_name, next_service_*
fuel_logs         → vehicle_id, fill_date, odometer, liters, price_per_liter, total_cost
reminders         → vehicle_id, title, due_date, due_odometer, priority, status
```

---

## 📝 License

MIT — free to use and modify.
