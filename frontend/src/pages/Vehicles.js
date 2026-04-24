import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Car, Zap, Gauge } from 'lucide-react';
import Modal from '../components/Modal';
import { vehicleAPI } from '../utils/api';

const FUEL_TYPES = ['gasoline', 'diesel', 'electric', 'hybrid', 'other'];
const FUEL_ICONS = { electric: '⚡', gasoline: '⛽', diesel: '🛢️', hybrid: '🔋', other: '🔧' };

function VehicleForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    make: '', model: '', year: new Date().getFullYear(),
    license_plate: '', vin: '', color: '', odometer: '',
    fuel_type: 'gasoline', notes: '', ...initial,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Make *</label>
            <input className="form-input" placeholder="e.g. Toyota" value={form.make} onChange={e => set('make', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Model *</label>
            <input className="form-input" placeholder="e.g. Camry" value={form.model} onChange={e => set('model', e.target.value)} />
          </div>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Year *</label>
            <input className="form-input" type="number" min="1900" max={new Date().getFullYear()+1} value={form.year} onChange={e => set('year', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <input className="form-input" placeholder="e.g. Pearl White" value={form.color} onChange={e => set('color', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Fuel Type</label>
            <select className="form-input" value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)}>
              {FUEL_TYPES.map(t => <option key={t} value={t}>{FUEL_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">License Plate</label>
            <input className="form-input" placeholder="e.g. MH12AB1234" value={form.license_plate} onChange={e => set('license_plate', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Odometer (km)</label>
            <input className="form-input" type="number" min="0" placeholder="0" value={form.odometer} onChange={e => set('odometer', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">VIN</label>
          <input className="form-input" placeholder="17-character vehicle identification number" value={form.vin} onChange={e => set('vin', e.target.value.toUpperCase())} maxLength={17} />
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-input" placeholder="Any notes about this vehicle..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={loading || !form.make || !form.model}>
          {loading ? 'Saving...' : initial.id ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </>
  );
}

export default function Vehicles({ navigate }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = () => vehicleAPI.getAll().then(setVehicles).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) await vehicleAPI.update(editing.id, form);
      else await vehicleAPI.create(form);
      setShowModal(false); setEditing(null);
      load();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await vehicleAPI.delete(id); load(); }
    catch (e) { alert(e.message); }
    finally { setDeleteId(null); }
  };

  const fuelBadgeClass = { gasoline: 'badge-accent', diesel: 'badge-warning', electric: 'badge-info', hybrid: 'badge-success', other: 'badge-dim' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">VEHICLES</h1>
          <div className="page-subtitle">YOUR FLEET — {vehicles.length} REGISTERED</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={15} /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />LOADING VEHICLES...</div>
      ) : vehicles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Car size={48} /></div>
          <div className="empty-title">NO VEHICLES YET</div>
          <div className="empty-sub">Add your first vehicle to get started</div>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add Vehicle
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {vehicles.map(v => (
            <div key={v.id} className="vehicle-card">
              <div className="flex justify-between items-center">
                <div className="vehicle-make">{v.make}</div>
                <span className={`badge ${fuelBadgeClass[v.fuel_type] || 'badge-dim'}`}>
                  {FUEL_ICONS[v.fuel_type]} {v.fuel_type}
                </span>
              </div>
              <div className="vehicle-name">{v.model}</div>
              <div className="vehicle-odo">
                <Gauge size={14} style={{ display: 'inline', marginRight: '6px' }} />
                {Number(v.odometer).toLocaleString('en-IN')} km
              </div>
              <div className="vehicle-meta">
                <span className="vehicle-meta-item">
                  🪪 {v.license_plate || '—'}
                </span>
                {v.color && <span className="vehicle-meta-item">🎨 {v.color}</span>}
                <span className="vehicle-meta-item">
                  🔧 {v.service_count || 0} services
                </span>
                {v.pending_reminders > 0 && (
                  <span className="vehicle-meta-item" style={{ color: 'var(--warning)' }}>
                    🔔 {v.pending_reminders} reminder{v.pending_reminders > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              

              <div className="flex gap-8" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('maintenance', v.id)} style={{ flex: 1 }}>
                  Service Log
                </button>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditing(v); setShowModal(true); }}>
                  <Edit2 size={14} />
                </button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(v.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'EDIT VEHICLE' : 'ADD VEHICLE'}>
        <VehicleForm initial={editing || {}} onSave={handleSave} onCancel={() => { setShowModal(false); setEditing(null); }} loading={saving} />
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="DELETE VEHICLE">
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            This will permanently delete the vehicle and all associated service records, fuel logs, and reminders. This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete Permanently</button>
        </div>
      </Modal>
    </div>
  );
}
