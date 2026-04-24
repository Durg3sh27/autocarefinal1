import React from 'react';
import { LayoutDashboard, Car, Wrench, Fuel, Bell, LogOut } from 'lucide-react';

const navItems = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'vehicles',    label: 'Vehicles',     icon: Car },
  { id: 'maintenance', label: 'Service Log',  icon: Wrench },
  { id: 'fuel',        label: 'Fuel Log',     icon: Fuel },
  { id: 'reminders',   label: 'Reminders',    icon: Bell, badgeKey: 'overdue' },
];

export default function Sidebar({ currentPage, setCurrentPage, overdueCount, user, onLogout }) {
  // Derive initials from user name
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 20L8 8h12l4 12H4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="9"  cy="21" r="2.5" fill="currentColor"/>
            <circle cx="19" cy="21" r="2.5" fill="currentColor"/>
            <path d="M7 14h14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          GARAGE<span>IQ</span>
        </div>
        <div className="logo-sub">Maintenance System</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => {
          const Icon    = item.icon;
          const isActive = currentPage === item.id;
          const hasBadge = item.badgeKey === 'overdue' && overdueCount > 0;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon size={16} />
              {item.label}
              {hasBadge && <span className="badge">{overdueCount}</span>}
            </button>
          );
        })}
      </nav>

      {/* User panel + logout */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        {/* User info */}
        <div style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border)',
        }}>
          {/* Avatar */}
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '12px',
            color: 'var(--accent)', fontWeight: 600, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-dim)', letterSpacing: '0.5px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.role === 'admin' ? '⬡ ADMIN' : '◇ USER'}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          className="nav-item"
          onClick={onLogout}
          style={{ color: 'var(--danger)', width: '100%', padding: '12px 20px' }}
        >
          <LogOut size={15} />
          Sign Out
        </button>

        <div style={{ padding: '8px 20px 12px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
          GarageIQ v1.0.0
        </div>
      </div>
    </aside>
  );
}
