import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';
import FuelLog from './pages/FuelLog';
import Reminders from './pages/Reminders';
import LoginPage from './pages/LoginPage';
import { reminderAPI } from './utils/api';

function App() {
  const [user, setUser]                   = useState(null);
  const [authReady, setAuthReady]         = useState(false);
  const [currentPage, setCurrentPage]     = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [overdueCount, setOverdueCount]   = useState(0);

  // Rehydrate session from localStorage on first load
  useEffect(() => {
    const token    = localStorage.getItem('garageiq_token');
    const userJson = localStorage.getItem('garageiq_user');
    if (token && userJson) {
      try { setUser(JSON.parse(userJson)); } catch { /* corrupt — ignore */ }
    }
    setAuthReady(true);
  }, []);

  // Load overdue badge count whenever page changes (and user is logged in)
  useEffect(() => {
    if (!user) return;
    reminderAPI.getAll({ status: 'pending' })
      .then(data => setOverdueCount(data.filter(r => r.is_overdue).length))
      .catch(() => {});
  }, [currentPage, user]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('garageiq_token');
    localStorage.removeItem('garageiq_user');
    setUser(null);
    setCurrentPage('dashboard');
  };

  const navigate = (page, vehicleId = null) => {
    setCurrentPage(page);
    if (vehicleId) setSelectedVehicleId(vehicleId);
  };

  // Wait until we've checked localStorage before deciding what to render
  if (!authReady) return null;

  // Not logged in → show login page
  if (!user) return <LoginPage onLogin={handleLogin} />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':   return <Dashboard navigate={navigate} />;
      case 'vehicles':    return <Vehicles navigate={navigate} />;
      case 'maintenance': return <Maintenance selectedVehicleId={selectedVehicleId} />;
      case 'fuel':        return <FuelLog selectedVehicleId={selectedVehicleId} />;
      case 'reminders':   return <Reminders />;
      default:            return <Dashboard navigate={navigate} />;
    }
  };

  return (
    <Router>
      <div className="app-layout">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={navigate}
          overdueCount={overdueCount}
          user={user}
          onLogout={handleLogout}
        />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </Router>
  );
}

export default App;
