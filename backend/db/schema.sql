-- ============================================================
-- GarageIQ — Database Schema + Seed Data
-- Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS garageiq CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE garageiq;

-- ============================================================
-- TABLES
-- ============================================================

DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS fuel_logs;
DROP TABLE IF EXISTS maintenance_records;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('admin','user') DEFAULT 'user',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  make            VARCHAR(100)  NOT NULL,
  model           VARCHAR(100)  NOT NULL,
  year            INT           NOT NULL,
  license_plate   VARCHAR(20),
  vin             VARCHAR(17),
  color           VARCHAR(50),
  odometer        INT           DEFAULT 0,
  fuel_type       ENUM('gasoline','diesel','electric','hybrid','other') DEFAULT 'gasoline',
  status          ENUM('active','inactive','sold')                      DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_records (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id            INT           NOT NULL,
  service_type          VARCHAR(100)  NOT NULL,
  description           TEXT,
  cost                  DECIMAL(10,2) DEFAULT 0.00,
  odometer              INT,
  service_date          DATE          NOT NULL,
  shop_name             VARCHAR(150),
  technician            VARCHAR(100),
  parts_used            TEXT,
  next_service_date     DATE,
  next_service_odometer INT,
  status                ENUM('completed','in_progress','scheduled') DEFAULT 'completed',
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE fuel_logs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id       INT             NOT NULL,
  fill_date        DATE            NOT NULL,
  odometer         INT             NOT NULL,
  liters           DECIMAL(8,3)    NOT NULL,
  price_per_liter  DECIMAL(8,3)    NOT NULL,
  total_cost       DECIMAL(10,2)   NOT NULL,
  station_name     VARCHAR(150),
  fuel_type        VARCHAR(50),
  full_tank        BOOLEAN         DEFAULT TRUE,
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE reminders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id     INT          NOT NULL,
  title          VARCHAR(150) NOT NULL,
  description    TEXT,
  due_date       DATE,
  due_odometer   INT,
  priority       ENUM('low','medium','high','critical') DEFAULT 'medium',
  status         ENUM('pending','dismissed','completed') DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);


-- ============================================================
-- VEHICLES (8 vehicles)
-- ============================================================

INSERT INTO vehicles (make, model, year, license_plate, vin, color, odometer, fuel_type, notes) VALUES
('Toyota',   'Camry',      2020, 'MH12AB1234', '1HGBH41JXMN109186', 'Pearl White',    45230, 'gasoline', 'Personal car. Full service history at Toyota ASC.'),
('Honda',    'City',       2019, 'MH14CD5678', '2T1BURHE0JC034565', 'Midnight Black',  67890, 'gasoline', 'Wife''s daily driver. AC service due.'),
('Tata',     'Nexon EV',   2022, 'MH01EF9012', '3VWFE21C04M000001', 'Pristine White',  12450, 'electric', 'Company vehicle. Charging at office daily.'),
('Maruti',   'Swift',      2018, 'MH02GH3456', '4T1BF3EK5AU565768', 'Fire Red',        88760, 'gasoline', 'Old reliable. Front tyres need replacement.'),
('Hyundai',  'Creta',      2021, 'MH04IJ7890', '5YFBURHE0FP241831', 'Phantom Black',   33120, 'diesel',   'Weekend car. Well maintained.'),
('Mahindra', 'Thar',       2023, 'MH06KL2345', '6G1ZT54894L902961', 'Mystic Copper',    8900, 'diesel',   'Off-roader. Monthly wash and check.'),
('BMW',      '3 Series',   2021, 'MH09MN6789', '7JR7DNCL4AN000375', 'Alpine White',    28340, 'gasoline', 'Premium service at BMW dealership only.'),
('Kia',      'Seltos',     2022, 'MH11PQ0123', '8AFACGEB6LY059201', 'Gravity Grey',    19870, 'gasoline', 'Bought used. Service history unknown before 10k km.');


-- ============================================================
-- MAINTENANCE RECORDS (35 records)
-- ============================================================

INSERT INTO maintenance_records
  (vehicle_id, service_type, description, cost, odometer, service_date, shop_name, technician, parts_used, next_service_date, next_service_odometer, status)
VALUES
-- Toyota Camry (1)
(1,'Oil Change',     'Full synthetic 5W-30 4L + OEM filter',                            2800.00,10000,'2021-06-15','Toyota ASC Andheri',   'Rajesh K.', 'Castrol Edge 5W-30 4L, OEM Filter',                '2021-12-15',15000,'completed'),
(1,'Oil Change',     'Full synthetic 5W-30 + OEM filter',                               2800.00,15100,'2021-12-20','Toyota ASC Andheri',   'Rajesh K.', 'Castrol Edge 5W-30 4L, OEM Filter',                '2022-06-20',20000,'completed'),
(1,'Tyre Rotation',  'All four tyres rotated and balanced',                               800.00,20000,'2022-06-22','MRF Tyre Service',     'Arvind M.', NULL,                                               '2022-12-22',25000,'completed'),
(1,'Oil Change',     'Synthetic oil + air filter replaced',                              3200.00,25200,'2022-12-10','Toyota ASC Andheri',   'Rajesh K.', 'Castrol Edge 5W-30 4L, Air Filter',                '2023-06-10',30000,'completed'),
(1,'Brake Pads',     'Front brake pads replaced — OEM',                                  4200.00,30500,'2023-03-18','Toyota ASC Andheri',   'Sunil T.',  'OEM Front Brake Pads x2',                         '2025-03-18',60000,'completed'),
(1,'AC Service',     'AC gas recharge, condenser clean, cabin filter replaced',          3500.00,35000,'2023-07-05','CoolCool AC Works',    'Imran S.',  'R134a Gas 400g, Cabin Filter',                    '2024-07-05', NULL ,'completed'),
(1,'Oil Change',     'Full synthetic oil change',                                        2800.00,40100,'2024-01-14','Toyota ASC Andheri',   'Rajesh K.', 'Castrol Edge 5W-30 4L, OEM Filter',                '2024-07-14',45000,'completed'),
(1,'Tyre Rotation',  'Rotation + 2 new rear tyres fitted',                              7600.00,44500,'2024-02-10','MRF Tyre Service',     'Arvind M.', 'MRF ZLX 195/65R15 x2',                            '2024-08-10',49500,'completed'),
(1,'Oil Change',     'Full synthetic 5W-30 + OEM filter',                               2800.00,45000,'2024-03-15','Toyota ASC Andheri',   'Rajesh K.', 'Castrol Edge 5W-30 4L, OEM Filter',                '2024-09-15',50000,'completed'),
(1,'Annual Service', '45,000 km full scheduled service',                                 8500.00,45200,'2024-03-20','Toyota ASC Andheri',   'Sunil T.',  'Oil, Filter, Air Filter, Spark Plugs x4',          '2025-03-20',55000,'completed'),

-- Honda City (2)
(2,'Oil Change',     '10W-30 semi-synthetic oil change',                                 1800.00,20000,'2020-08-10','Honda Care Bandra',    'Pradeep N.','Honda Genuine 10W-30 3.5L, OEM Filter',            '2021-02-10',25000,'completed'),
(2,'Oil Change',     '10W-30 + fuel injector cleaner',                                   2400.00,40000,'2022-03-22','Honda Care Bandra',    'Pradeep N.','Honda 10W-30 3.5L, Injector Cleaner',              '2022-09-22',45000,'completed'),
(2,'Annual Service', '60k service — timing belt, coolant flush',                        12000.00,60100,'2023-09-05','Honda Care Bandra',    'Pradeep N.','Timing Belt Kit, Coolant 5L, Oil Filter',          '2024-09-05',70000,'completed'),
(2,'Wheel Alignment','Four-wheel alignment and balancing',                                 900.00,65000,'2024-02-14','Wheel Masters',        'Aarav J.',  NULL,                                                NULL,         NULL,'completed'),
(2,'Brake Pads',     'Front and rear brake pads replaced',                               4500.00,67000,'2024-04-01','Honda Care Bandra',    'Suresh D.', 'Brembo Front Pads, OEM Rear Pads',                '2025-04-01',87000,'completed'),

-- Tata Nexon EV (3)
(3,'Battery Check',  'EV battery health diagnostic — 98% health',                            0.00, 5000,'2022-11-10','Tata Motors EV Hub',  'Vikram R.', NULL,                                               '2023-05-10',10000,'completed'),
(3,'Tyre Rotation',  'All four tyres rotated',                                             600.00,10000,'2023-08-15','GoTyre Service',       'Rajan P.',  NULL,                                               '2024-02-15',15000,'completed'),
(3,'Battery Check',  'EV battery diagnostic + OTA update v3.1 — 96% health',                 0.00,12000,'2024-03-20','Tata Motors EV Hub',  'Vikram R.', NULL,                                               '2024-09-20',17000,'completed'),
(3,'Annual Service', '12,000 km EV annual service',                                       2500.00,12000,'2024-03-22','Tata Motors EV Hub',  'Vikram R.', 'Brake Fluid, Washer Fluid, Wiper Blades',          '2025-03-22',24000,'completed'),

-- Maruti Swift (4)
(4,'Oil Change',     'Semi-synthetic 10W-40',                                            1200.00,50000,'2021-06-01','Maruti NEXA Malad',   'Devendra S.','Castrol Magnatec 10W-40 3L',                     '2021-12-01',55000,'completed'),
(4,'Oil Change',     '10W-40 + spark plugs replaced',                                    2100.00,70000,'2023-01-18','Maruti NEXA Malad',   'Devendra S.','Castrol 10W-40 3L, NGK Spark Plugs x4',           '2023-07-18',75000,'completed'),
(4,'Suspension',     'Front shock absorbers replaced — worn out',                        8500.00,80000,'2023-09-30','Experts Auto Works',  'Karim B.',  'Monroe Front Shock Absorbers x2',                  NULL,         NULL,'completed'),
(4,'Oil Change',     'Semi-synthetic oil + oil filter',                                  1400.00,88000,'2024-04-05','Maruti NEXA Malad',   'Devendra S.','Castrol 10W-40 3L, OEM Oil Filter',               '2024-10-05',93000,'completed'),

-- Hyundai Creta (5)
(5,'Oil Change',     'Diesel 5W-30 full synthetic',                                      3200.00,10000,'2022-03-14','Hyundai Star Vikhroli','Anil V.',   'Motul 5W-30 Diesel 5L, OEM Filter',               '2022-09-14',15000,'completed'),
(5,'Oil Change',     'Diesel full synthetic oil change',                                  3200.00,20000,'2022-09-20','Hyundai Star Vikhroli','Anil V.',   'Motul 5W-30 Diesel 5L, OEM Filter',               '2023-03-20',25000,'completed'),
(5,'AC Service',     'AC compressor belt replaced, gas recharged',                       5400.00,28000,'2023-10-10','CoolCool AC Works',    'Imran S.',  'AC Compressor Belt, R134a Gas 500g',              '2024-10-10', NULL,'completed'),
(5,'Oil Change',     'Diesel oil change + DPF check',                                    3500.00,33000,'2024-03-01','Hyundai Star Vikhroli','Anil V.',   'Motul 5W-30 Diesel 5L, OEM Filter',               '2024-09-01',38000,'completed'),

-- Mahindra Thar (6)
(6,'Oil Change',     'First free service — 1,000 km',                                       0.00, 1000,'2023-03-10','Mahindra ASC Thane',  'Ravi P.',   'Engine Oil 5W-30 5L, OEM Filter',                 '2023-09-10', 5000,'completed'),
(6,'Oil Change',     'Diesel 5W-30 — 5,000 km service',                                 2800.00, 5000,'2023-09-15','Mahindra ASC Thane',  'Ravi P.',   'Shell Rimula 5W-30 5L, OEM Filter',               '2024-03-15',10000,'completed'),
(6,'Annual Service', '10,000 km service — all fluids, 4WD check',                       9500.00, 8800,'2024-04-02','Mahindra ASC Thane',  'Ravi P.',   'Engine Oil, Diff Oil, Transfer Case Oil, Filters', '2025-04-02',15000,'completed'),

-- BMW 3 Series (7)
(7,'Oil Change',     'BMW Longlife 5W-30 oil change',                                    8500.00,15000,'2022-06-20','BMW Navnit Mumbai',   'Klaus W.',  'BMW Longlife 5W-30 6L, BMW OEM Filter',            '2023-06-20',25000,'completed'),
(7,'Brake Pads',     'All four brake pads + rotors replaced',                           28000.00,27500,'2024-01-12','BMW Navnit Mumbai',   'Klaus W.',  'OEM Brake Pads x4, OEM Rotors x4',                '2026-01-12',55000,'completed'),
(7,'Annual Service', 'Annual inspection, brake fluid, air filter',                      15000.00,25000,'2023-06-25','BMW Navnit Mumbai',   'Klaus W.',  'BMW Fluid Kit, Air Filter, Cabin Filter',          '2024-06-25',35000,'completed'),

-- Kia Seltos (8)
(8,'Oil Change',     'Full synthetic 5W-30',                                             2600.00,10000,'2022-12-05','Kia Chembur',         'Nilesh A.', 'Shell Helix Ultra 5W-30 4L, OEM Filter',           '2023-06-05',15000,'completed'),
(8,'Wheel Alignment','Four-wheel alignment after pothole damage',                          850.00,18000,'2024-01-20','Wheel Masters',       'Aarav J.',  NULL,                                                NULL,         NULL,'completed'),
(8,'Oil Change',     'Full synthetic 5W-30',                                             2600.00,19500,'2024-03-30','Kia Chembur',         'Nilesh A.', 'Shell Helix Ultra 5W-30 4L, OEM Filter',           '2024-09-30',24000,'completed');


-- ============================================================
-- FUEL LOGS (35 entries)
-- ============================================================

INSERT INTO fuel_logs (vehicle_id, fill_date, odometer, liters, price_per_liter, total_cost, station_name, fuel_type, full_tank, notes) VALUES

-- Toyota Camry (1) — 12 entries
(1,'2023-09-02',36000, 44.0, 98.50, 4334.00,'HP Petrol, Andheri',          'Petrol',TRUE, NULL),
(1,'2023-09-28',36650, 41.5, 99.20, 4116.80,'Indian Oil, Juhu',            'Petrol',TRUE, NULL),
(1,'2023-10-22',37280, 42.0,100.50, 4221.00,'BPCL, Vile Parle',            'Petrol',TRUE, NULL),
(1,'2023-11-18',37900, 40.8,101.00, 4120.80,'HP Petrol, Andheri',          'Petrol',TRUE, NULL),
(1,'2023-12-14',38520, 43.2,101.50, 4384.80,'Indian Oil, Juhu',            'Petrol',TRUE, NULL),
(1,'2024-01-10',39200, 41.0,102.00, 4182.00,'BPCL, Vile Parle',            'Petrol',TRUE, NULL),
(1,'2024-02-05',39850, 42.5,102.50, 4356.25,'HP Petrol, Andheri',          'Petrol',TRUE, NULL),
(1,'2024-02-28',40490, 40.0,102.50, 4100.00,'Indian Oil, Jogeshwari',      'Petrol',TRUE, NULL),
(1,'2024-03-20',41100, 43.0,103.00, 4429.00,'BPCL, Vile Parle',            'Petrol',FALSE,'Half tank only'),
(1,'2024-03-25',44700, 38.2,101.80, 3888.76,'Indian Oil, Andheri',         'Petrol',TRUE, NULL),
(1,'2024-04-10',45100, 42.5,102.50, 4356.25,'HP Petrol Pump, Andheri',     'Petrol',TRUE, NULL),
(1,'2024-04-20',45730, 41.0,103.20, 4231.20,'BPCL, Vile Parle',            'Petrol',TRUE, NULL),

-- Honda City (2) — 10 entries
(2,'2023-10-05',58000, 36.0, 99.50, 3582.00,'Indian Oil, Bandra',          'Petrol',TRUE, NULL),
(2,'2023-10-30',58680, 35.5,100.00, 3550.00,'HP, Khar',                    'Petrol',TRUE, NULL),
(2,'2023-11-25',59350, 37.0,100.50, 3718.50,'BPCL, Santacruz',             'Petrol',TRUE, NULL),
(2,'2023-12-20',59990, 36.2,101.00, 3656.20,'Indian Oil, Bandra',          'Petrol',TRUE, NULL),
(2,'2024-01-15',60650, 35.0,101.50, 3552.50,'HP, Khar',                    'Petrol',TRUE, NULL),
(2,'2024-02-10',61300, 36.8,102.00, 3753.60,'BPCL, Santacruz',             'Petrol',TRUE, NULL),
(2,'2024-03-07',61950, 35.5,102.50, 3638.75,'Indian Oil, Bandra',          'Petrol',TRUE, NULL),
(2,'2024-03-30',62600, 34.0,103.00, 3502.00,'HP, Khar',                    'Petrol',TRUE, NULL),
(2,'2024-04-12',67800, 35.0,103.00, 3605.00,'BPCL Station, Santacruz',     'Petrol',TRUE, NULL),
(2,'2024-04-22',68450, 36.5,103.50, 3777.75,'Indian Oil, Bandra',          'Petrol',TRUE, NULL),

-- Maruti Swift (4) — 7 entries
(4,'2023-11-10',80500, 32.0, 99.50, 3184.00,'HP, Malad',                   'Petrol',TRUE, NULL),
(4,'2023-12-08',81100, 31.0,100.00, 3100.00,'Indian Oil, Goregaon',        'Petrol',TRUE, NULL),
(4,'2024-01-06',81680, 33.0,101.00, 3333.00,'BPCL, Malad West',            'Petrol',TRUE, NULL),
(4,'2024-02-03',82280, 30.5,101.50, 3095.75,'HP, Malad',                   'Petrol',TRUE, NULL),
(4,'2024-03-02',82870, 31.5,102.00, 3213.00,'Indian Oil, Goregaon',        'Petrol',TRUE, NULL),
(4,'2024-03-28',83450, 32.5,102.50, 3331.25,'BPCL, Malad West',            'Petrol',TRUE, NULL),
(4,'2024-04-18',88600, 31.0,103.00, 3193.00,'HP, Malad',                   'Petrol',TRUE, NULL),

-- Hyundai Creta diesel (5) — 6 entries
(5,'2024-01-08',29000, 48.0, 88.50, 4248.00,'HP Diesel, Vikhroli',         'Diesel',TRUE, NULL),
(5,'2024-01-30',29750, 46.5, 89.00, 4138.50,'Indian Oil Diesel, Ghatkopar','Diesel',TRUE, NULL),
(5,'2024-02-22',30480, 47.0, 89.50, 4206.50,'BPCL Diesel, Powai',          'Diesel',TRUE, NULL),
(5,'2024-03-15',31200, 48.5, 90.00, 4365.00,'HP Diesel, Vikhroli',         'Diesel',TRUE, NULL),
(5,'2024-04-05',31950, 46.0, 90.50, 4163.00,'Indian Oil Diesel, Ghatkopar','Diesel',TRUE, NULL),
(5,'2024-04-20',33000, 49.0, 91.00, 4459.00,'BPCL Diesel, Powai',          'Diesel',TRUE, NULL);


-- ============================================================
-- REMINDERS (21 reminders — pending / completed / dismissed)
-- ============================================================

INSERT INTO reminders (vehicle_id, title, description, due_date, due_odometer, priority, status) VALUES
-- Toyota Camry (1)
(1,'Oil Change Due',          'Synthetic oil at 50,000 km or Sep 2024',             '2024-09-15',50000, 'medium',  'pending'),
(1,'PUC Certificate Renewal', 'Pollution Under Control cert expires June 2024',     '2024-06-30', NULL, 'critical','pending'),
(1,'Tyre Replacement',        'All four tyres near end of life — check tread depth','2024-08-01',50000, 'high',    'pending'),
(1,'Insurance Renewal',       'Policy expires 15 Nov 2024',                         '2024-11-15', NULL, 'high',    'pending'),
(1,'Wheel Alignment',         'Car pulling slightly left — check after highway trip', NULL,        48000,'low',     'pending'),

-- Honda City (2)
(2,'AC Service',              'AC not cooling well — service before summer',         '2024-05-15', NULL, 'high',    'pending'),
(2,'Insurance Renewal',       'Annual insurance policy renewal',                     '2024-07-20', NULL, 'high',    'pending'),
(2,'Oil Change',              '70,000 km oil change due',                            '2024-07-10',70000, 'medium',  'pending'),
(2,'PUC Certificate',         'PUC expires August 2024',                             '2024-08-05', NULL, 'critical','pending'),

-- Nexon EV (3)
(3,'Annual EV Service',       'EV annual check + battery diagnostic',                '2024-09-20',17000, 'medium',  'pending'),
(3,'Software Update',         'OTA firmware v3.2 available — book at dealership',   '2024-06-01', NULL, 'low',     'pending'),
(3,'Tyre Rotation',           'Rotate tyres at 15,000 km',                          '2024-08-15',15000, 'low',     'pending'),

-- Maruti Swift (4)
(4,'Front Tyre Replacement',  'Both fronts worn — replace before monsoon',           '2024-06-10',90000, 'critical','pending'),
(4,'Oil Change',              'Next oil change at 93,000 km',                        '2024-10-05',93000, 'medium',  'pending'),
(4,'Brake Fluid Flush',       'Brake fluid last changed at 60k — overdue',           '2024-05-20', NULL, 'high',    'pending'),

-- Hyundai Creta (5)
(5,'Diesel Fuel Filter',      'Replace diesel filter at 40,000 km',                 '2024-09-01',40000, 'medium',  'pending'),
(5,'Oil Change',              'Diesel oil change at 38,000 km',                     '2024-09-01',38000, 'medium',  'pending'),

-- BMW (7)
(7,'Annual Service',          'BMW Annual Inspection due June 2024',                 '2024-06-25',35000, 'high',    'pending'),
(7,'Tyre Check',              'Run-flat tyres showing sidewall wear — inspect',       NULL,        30000, 'medium',  'pending'),

-- Completed + dismissed samples
(1,'AC Service 2023',         'AC serviced successfully July 2023',                  '2023-07-05', NULL, 'medium',  'completed'),
(2,'Timing Belt Check',       'Dismissed — belt replaced by previous owner',         '2023-09-10', NULL, 'high',    'dismissed');


-- ============================================================
-- USERS  (bcrypt hashed passwords — plain text: Admin@123 / User@123)
-- ============================================================

INSERT INTO users (name, email, password, role) VALUES
('Arjun Sharma',  'admin@garageiq.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkdEW1lbzHS', 'admin'),
('Priya Mehta',   'priya@garageiq.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkdEW1lbzHS', 'user');
