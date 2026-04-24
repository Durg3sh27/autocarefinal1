import React, { useState, useEffect } from 'react';
import { Car, Wrench, Fuel, Bell, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { statsAPI } from '../utils/api';
import { format } from 'date-fns';

const PIE_COLORS = ['#f97316', '#22d3ee', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '4px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent)' }}>
          ₹{Number(payload[0].value).toLocaleString('en-IN')}
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ navigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.getDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      LOADING DASHBOARD...
    </div>
  );

  if (!stats) return <div className="loading">Failed to load dashboard data.</div>;

  const monthlyCostData = (stats.monthly_costs || []).map(r => ({
    month: r.month,
    cost: parseFloat(r.total) || 0,
  }));

  const pieData = (stats.service_types || []).map(r => ({
    name: r.service_type,
    value: parseInt(r.count),
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">DASHBOARD</h1>
          <div className="page-subtitle">FLEET OVERVIEW — {format(new Date(), 'dd MMM yyyy').toUpperCase()}</div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-4 mb-32">
        <div className="stat-card">
          <div className="stat-label">Active Vehicles</div>
          <div className="stat-value accent">{stats.vehicles?.total || 0}</div>
          <div className="stat-change flex items-center gap-4">
            <Car size={12} style={{ color: 'var(--accent)' }} />
            {Number(stats.vehicles?.total_km || 0).toLocaleString('en-IN')} km total
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Services This Year</div>
          <div className="stat-value cyan">{stats.maintenance?.total || 0}</div>
          <div className="stat-change flex items-center gap-4">
            <Wrench size={12} style={{ color: 'var(--accent-2)' }} />
            ₹{Number(stats.maintenance?.total_spent || 0).toLocaleString('en-IN')} spent
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Fuel Fill-ups</div>
          <div className="stat-value success">{stats.fuel?.total_fillups || 0}</div>
          <div className="stat-change flex items-center gap-4">
            <Fuel size={12} style={{ color: 'var(--success)' }} />
            {Number(stats.fuel?.total_liters || 0).toFixed(0)}L total
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Reminders</div>
          <div className={`stat-value ${stats.reminders?.overdue > 0 ? 'danger' : ''}`}>
            {stats.reminders?.total || 0}
          </div>
          <div className="stat-change flex items-center gap-4">
            {stats.reminders?.overdue > 0
              ? <><AlertTriangle size={12} style={{ color: 'var(--danger)' }} />{stats.reminders.overdue} overdue</>
              : <><Bell size={12} />&nbsp;All on track</>
            }
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-32">
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px' }}>MAINTENANCE SPEND</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px' }}>LAST 6 MONTHS</div>
            </div>
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
          </div>
          {monthlyCostData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyCostData} barSize={24}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" fill="var(--accent)" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-sub">No maintenance data yet</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px' }}>SERVICE TYPES</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px' }}>BREAKDOWN</div>
            </div>
            <Wrench size={18} style={{ color: 'var(--accent-2)' }} />
          </div>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-16">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-8" style={{ marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-sub">No service data yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px', marginBottom: '16px' }}>QUICK ACTIONS</div>
        <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('vehicles')}>
            <Car size={15} /> Add Vehicle
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('maintenance')}>
            <Wrench size={15} /> Log Service
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('fuel')}>
            <Fuel size={15} /> Add Fuel Entry
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('reminders')}>
            <Bell size={15} /> Set Reminder
          </button>
        </div>
      </div>
    </div>
  );
}
