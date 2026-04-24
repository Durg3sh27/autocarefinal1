import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Fuel, TrendingDown, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from '../components/Modal';
import { fuelAPI, vehicleAPI } from '../utils/api';
import { format, parseISO } from 'date-fns';

function FuelForm({ vehicles, onSave, onCancel, loading }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState({
    vehicle_id: vehicles[0]?.id || '',
    fill_date: today, odometer: '', liters: '',
    price_per_liter: '', total_cost: '',
    station_name: '', fuel_type: 'Petrol', full_tank: true, notes: '',
  });
  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if ((k === 'liters' || k === 'price_per_liter') && next.liters && next.price_per_liter) {
      next.total_cost = (parseFloat(next.liters) * parseFloat(next.price_per_liter)).toFixed(2);
    }
    return next;
  });

  return (
    <>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vehicle *</label>
            <select className="form-input" value={form.vehicle_id} onChange={e => set('vehicle_id', e.target.value)}>
              {vehicles.map(v => (<option key={v.id} value={v.id}>{v.license_plate ? `${v.license_plate} — ` : ''}{v.year} {v.make} {v.model}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="form-input" type="date" value={form.fill_date} onChange={e => set('fill_date', e.target.value)} />
          </div>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Odometer (km) *</label>
            <input className="form-input" type="number" min="0" placeholder="Current reading" value={form.odometer} onChange={e => set('odometer', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Litres *</label>
            <input className="form-input" type="number" min="0" step="0.001" placeholder="0.000" value={form.liters} onChange={e => set('liters', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Price/Litre (₹) *</label>
            <input className="form-input" type="number" min="0" step="0.001" placeholder="0.000" value={form.price_per_liter} onChange={e => set('price_per_liter', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Total Cost (₹) — auto-calculated</label>
            <input className="form-input" type="number" min="0" step="0.01" value={form.total_cost}
              onChange={e => set('total_cost', e.target.value)}
              style={{ borderColor: form.total_cost ? 'var(--accent)' : undefined }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fuel Type</label>
            <select className="form-input" value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)}>
              {['Petrol', 'Diesel', 'CNG', 'EV Charge', 'Premium Petrol'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Station Name</label>
            <input className="form-input" placeholder="e.g. HP Petrol Pump, MG Road" value={form.station_name} onChange={e => set('station_name', e.target.value)} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', paddingBottom: '10px' }}>
              <input type="checkbox" checked={form.full_tank} onChange={e => set('full_tank', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>FULL TANK</span>
            </label>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={loading || !form.vehicle_id || !form.odometer || !form.liters || !form.price_per_liter}>
          {loading ? 'Saving...' : 'Add Fuel Entry'}
        </button>
      </div>
    </>
  );
}

export default function FuelLog({ selectedVehicleId }) {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filterVehicle, setFilterVehicle] = useState(selectedVehicleId || '');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = filterVehicle ? { vehicle_id: filterVehicle } : {};
    fuelAPI.getAll(params).then(setLogs).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { vehicleAPI.getAll().then(setVehicles).catch(console.error); }, []);
  useEffect(() => { setLoading(true); load(); }, [filterVehicle]);

  const handleSave = async (form) => {
    setSaving(true);
    try { await fuelAPI.create(form); setShowModal(false); load(); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fuel entry?')) return;
    await fuelAPI.delete(id).catch(e => alert(e.message));
    load();
  };

  const totalLiters = logs.reduce((s, l) => s + parseFloat(l.liters || 0), 0);
  const totalCost = logs.reduce((s, l) => s + parseFloat(l.total_cost || 0), 0);
  const avgPrice = logs.length ? (logs.reduce((s, l) => s + parseFloat(l.price_per_liter || 0), 0) / logs.length) : 0;

  const chartData = [...logs].reverse().slice(-15).map(l => ({
    date: l.fill_date ? format(parseISO(l.fill_date), 'dd/MM') : '',
    price: parseFloat(l.price_per_liter),
    efficiency: l.efficiency_l_per_100km ? parseFloat(l.efficiency_l_per_100km) : null,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">FUEL LOG</h1>
          <div className="page-subtitle">{totalLiters.toFixed(0)}L CONSUMED — ₹{totalCost.toLocaleString('en-IN')} SPENT</div>
        </div>
        <div className="flex gap-12 items-center">
          <div className="flex items-center gap-8">
            <Filter size={14} style={{ color: 'var(--text-dim)' }} />
            <select className="form-input" style={{ width: '200px' }} value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
              <option value="">All Vehicles</option>
              {vehicles.map(v => (<option key={v.id} value={v.id}>{v.license_plate ? `${v.license_plate} — ` : ''}{v.year} {v.make} {v.model}</option>))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add Entry
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid-3 mb-24">
        <div className="stat-card">
          <div className="stat-label">Total Fill-ups</div>
          <div className="stat-value accent">{logs.length}</div>
          <div className="stat-change">{totalLiters.toFixed(1)} litres total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Fuel Spend</div>
          <div className="stat-value cyan">₹{(totalCost/1000).toFixed(1)}k</div>
          <div className="stat-change">Avg ₹{(logs.length ? totalCost / logs.length : 0).toFixed(0)}/fillup</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Price/Litre</div>
          <div className="stat-value success">₹{avgPrice.toFixed(2)}</div>
          <div className="stat-change flex items-center gap-4"><TrendingDown size={12} /> Across {logs.length} entries</div>
        </div>
      </div>

      {/* Price trend chart */}
      {chartData.length > 1 && (
        <div className="card mb-24">
          <div className="flex items-center justify-between mb-16">
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '1px' }}>FUEL PRICE TREND</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px' }}>LAST 15 FILL-UPS</div>
            </div>
            <Fuel size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
              <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" />LOADING FUEL LOGS...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Fuel size={48} /></div>
            <div className="empty-title">NO FUEL ENTRIES</div>
            <div className="empty-sub">Track fuel consumption and costs</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Odometer</th>
                  <th>Litres</th>
                  <th>Price/L</th>
                  <th>Total</th>
                  <th>Efficiency</th>
                  <th>Station</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td className="td-mono">{l.fill_date ? format(parseISO(l.fill_date), 'dd MMM yyyy') : '—'}</td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '1.5px', marginBottom: '3px' }}>
                        {l.license_plate || '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {l.year} {l.make} {l.model}
                      </div>
                    </td>
                    <td className="td-mono">{Number(l.odometer).toLocaleString('en-IN')} km</td>
                    <td className="td-mono">{parseFloat(l.liters).toFixed(2)} L</td>
                    <td className="td-mono">₹{parseFloat(l.price_per_liter).toFixed(2)}</td>
                    <td className="td-mono" style={{ color: 'var(--accent)' }}>₹{Number(l.total_cost).toLocaleString('en-IN')}</td>
                    <td>
                      {l.efficiency_l_per_100km ? (
                        <div>
                          <span className="td-mono" style={{ fontSize: '12px', color: parseFloat(l.efficiency_l_per_100km) < 8 ? 'var(--success)' : 'var(--warning)' }}>
                            {l.efficiency_l_per_100km} L/100km
                          </span>
                          <div className="efficiency-bar">
                            <div className="efficiency-fill" style={{ width: `${Math.min(100, (1 - parseFloat(l.efficiency_l_per_100km) / 20) * 100)}%` }} />
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '12px' }}>{l.station_name || '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(l.id)}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="ADD FUEL ENTRY">
        {vehicles.length > 0 ? (
          <FuelForm vehicles={vehicles} onSave={handleSave} onCancel={() => setShowModal(false)} loading={saving} />
        ) : (
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)' }}>Please add a vehicle first.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
