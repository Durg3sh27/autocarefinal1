import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wrench, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import { maintenanceAPI, vehicleAPI } from '../utils/api';
import { format, parseISO } from 'date-fns';

const SERVICE_TYPES = [
  'Oil Change', 'Tyre Rotation', 'Tyre Replacement', 'Brake Pads', 'Brake Fluid',
  'Air Filter', 'Cabin Filter', 'Spark Plugs', 'Battery Replacement', 'Coolant Flush',
  'Transmission Service', 'Wheel Alignment', 'Suspension', 'AC Service',
  'Insurance', 'PUC Certificate', 'Annual Service', 'General Repair', 'Other'
];

const STATUS_BADGE = {
  completed:   'badge-success',
  in_progress: 'badge-warning',
  scheduled:   'badge-info',
};

// Vehicle cell — plate number bold on top, make/model/year dimmer below
function VehicleCell({ record }) {
  return (
    <td>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        fontWeight: 700,
        color: 'var(--accent)',
        letterSpacing: '1.5px',
        marginBottom: '3px',
      }}>
        {record.license_plate || '—'}
      </div>
      <div style={{
        fontSize: '11px',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-body)',
      }}>
        {record.year} {record.make} {record.model}
      </div>
    </td>
  );
}

function MaintenanceForm({ vehicles, initial = {}, onSave, onCancel, loading }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState({
    vehicle_id: vehicles[0]?.id || '',
    service_type: 'Oil Change',
    description: '', cost: '', odometer: '',
    service_date: today, shop_name: '', technician: '',
    parts_used: '', next_service_date: '', next_service_odometer: '',
    status: 'completed',
    ...initial,
    service_date: initial.service_date
      ? format(parseISO(initial.service_date), 'yyyy-MM-dd') : today,
    next_service_date: initial.next_service_date
      ? format(parseISO(initial.next_service_date), 'yyyy-MM-dd') : '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vehicle *</label>
            <select className="form-input" value={form.vehicle_id} onChange={e => set('vehicle_id', e.target.value)}>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.license_plate ? `${v.license_plate} — ` : ''}{v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Service Type *</label>
            <select className="form-input" value={form.service_type} onChange={e => set('service_type', e.target.value)}>
              {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Service Date *</label>
            <input className="form-input" type="date" value={form.service_date} onChange={e => set('service_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Cost (₹)</label>
            <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={form.cost} onChange={e => set('cost', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Odometer (km)</label>
            <input className="form-input" type="number" min="0" placeholder="Current reading" value={form.odometer} onChange={e => set('odometer', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Shop / Service Centre</label>
            <input className="form-input" placeholder="e.g. Toyota Service Centre" value={form.shop_name} onChange={e => set('shop_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" placeholder="Describe the work performed..." value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Parts Used</label>
          <input className="form-input" placeholder="e.g. Castrol 5W-30 4L, OEM filter" value={form.parts_used} onChange={e => set('parts_used', e.target.value)} />
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '2px', marginBottom: '12px' }}>
            NEXT SERVICE
          </div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Next Service Date</label>
              <input className="form-input" type="date" value={form.next_service_date} onChange={e => set('next_service_date', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Next Service Odometer</label>
              <input className="form-input" type="number" min="0" placeholder="km" value={form.next_service_odometer} onChange={e => set('next_service_odometer', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
        <button
          className="btn btn-primary"
          onClick={() => onSave(form)}
          disabled={loading || !form.vehicle_id || !form.service_type || !form.service_date}
        >
          {loading ? 'Saving...' : initial.id ? 'Update Record' : 'Add Record'}
        </button>
      </div>
    </>
  );
}

export default function Maintenance({ selectedVehicleId }) {
  const [records, setRecords]         = useState([]);
  const [vehicles, setVehicles]       = useState([]);
  const [filterVehicle, setFilterVehicle] = useState(selectedVehicleId || '');
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [saving, setSaving]           = useState(false);

  const load = () => {
    const params = filterVehicle ? { vehicle_id: filterVehicle } : {};
    maintenanceAPI.getAll(params)
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { vehicleAPI.getAll().then(setVehicles).catch(console.error); }, []);
  useEffect(() => { setLoading(true); load(); }, [filterVehicle]); // eslint-disable-line

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) await maintenanceAPI.update(editing.id, form);
      else         await maintenanceAPI.create(form);
      setShowModal(false); setEditing(null); load();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service record?')) return;
    await maintenanceAPI.delete(id).catch(e => alert(e.message));
    load();
  };

  const totalCost = records.reduce((s, r) => s + parseFloat(r.cost || 0), 0);

  // Build filter dropdown label showing plate + name
  const vehicleLabel = (v) =>
    v.license_plate ? `${v.license_plate} — ${v.year} ${v.make} ${v.model}` : `${v.year} ${v.make} ${v.model}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SERVICE LOG</h1>
          <div className="page-subtitle">
            {records.length} RECORDS — ₹{totalCost.toLocaleString('en-IN')} TOTAL
          </div>
        </div>
        <div className="flex gap-12 items-center">
          <div className="flex items-center gap-8">
            <Filter size={14} style={{ color: 'var(--text-dim)' }} />
            <select
              className="form-input"
              style={{ width: '240px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              value={filterVehicle}
              onChange={e => setFilterVehicle(e.target.value)}
            >
              <option value="">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{vehicleLabel(v)}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={15} /> Log Service
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" />LOADING RECORDS...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Wrench size={48} /></div>
            <div className="empty-title">NO RECORDS</div>
            <div className="empty-sub">Log your first service to start tracking</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Shop</th>
                  <th>Odometer</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Next Due</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="td-mono" style={{ whiteSpace: 'nowrap' }}>
                      {r.service_date ? format(parseISO(r.service_date), 'dd MMM yyyy') : '—'}
                    </td>

                    {/* ── Vehicle cell: plate prominent, name underneath ── */}
                    <VehicleCell record={r} />

                    <td>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px' }}>
                        {r.service_type}
                      </span>
                      {r.description && (
                        <div style={{
                          fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px',
                          maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {r.description}
                        </div>
                      )}
                    </td>

                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {r.shop_name || '—'}
                    </td>

                    <td className="td-mono" style={{ whiteSpace: 'nowrap' }}>
                      {r.odometer ? `${Number(r.odometer).toLocaleString('en-IN')} km` : '—'}
                    </td>

                    <td className="td-mono" style={{ color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                      {r.cost > 0 ? `₹${Number(r.cost).toLocaleString('en-IN')}` : 'Free'}
                    </td>

                    <td>
                      <span className={`badge ${STATUS_BADGE[r.status] || 'badge-dim'}`}>
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="td-mono" style={{ fontSize: '11px', whiteSpace: 'nowrap', color: 'var(--text-dim)' }}>
                      {r.next_service_date ? format(parseISO(r.next_service_date), 'dd MMM yyyy') : '—'}
                    </td>

                    <td>
                      <div className="flex gap-4">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title="Edit"
                          onClick={() => { setEditing(r); setShowModal(true); }}
                        >
                          <Wrench size={12} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          title="Delete"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'EDIT RECORD' : 'LOG SERVICE'}
        size="modal-lg"
      >
        {vehicles.length > 0 ? (
          <MaintenanceForm
            vehicles={vehicles}
            initial={editing || {}}
            onSave={handleSave}
            onCancel={() => { setShowModal(false); setEditing(null); }}
            loading={saving}
          />
        ) : (
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)' }}>
              Please add a vehicle first before logging service records.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
