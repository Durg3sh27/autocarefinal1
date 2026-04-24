import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Trash2, Bell, AlertTriangle, Clock } from 'lucide-react';
import Modal from '../components/Modal';
import { reminderAPI, vehicleAPI } from '../utils/api';
import { format, parseISO } from 'date-fns';

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_BADGE = { critical: 'badge-danger', high: 'badge-warning', medium: 'badge-accent', low: 'badge-success' };

function ReminderForm({ vehicles, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    vehicle_id: vehicles[0]?.id || '',
    title: '', description: '', due_date: '',
    due_odometer: '', priority: 'medium',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
            <label className="form-label">Priority</label>
            <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" placeholder="e.g. Oil Change Due, Insurance Renewal" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" placeholder="Additional details..." value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Due at Odometer (km)</label>
            <input className="form-input" type="number" min="0" placeholder="Optional" value={form.due_odometer} onChange={e => set('due_odometer', e.target.value)} />
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={loading || !form.vehicle_id || !form.title}>
          {loading ? 'Saving...' : 'Add Reminder'}
        </button>
      </div>
    </>
  );
}

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = filter ? { status: filter } : {};
    reminderAPI.getAll(params).then(data => {
      const sorted = [...data].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
      setReminders(sorted);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { vehicleAPI.getAll().then(setVehicles).catch(console.error); }, []);
  useEffect(() => { setLoading(true); load(); }, [filter]);

  const handleSave = async (form) => {
    setSaving(true);
    try { await reminderAPI.create(form); setShowModal(false); load(); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    await reminderAPI.updateStatus(id, status).catch(e => alert(e.message));
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    await reminderAPI.delete(id).catch(e => alert(e.message));
    load();
  };

  const overdue = reminders.filter(r => r.is_overdue).length;
  const upcoming = reminders.filter(r => !r.is_overdue && r.days_until_due !== null && r.days_until_due <= 30).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">REMINDERS</h1>
          <div className="page-subtitle">
            {overdue > 0 && <span style={{ color: 'var(--danger)' }}>{overdue} OVERDUE · </span>}
            {upcoming > 0 && <span style={{ color: 'var(--warning)' }}>{upcoming} DUE SOON · </span>}
            {reminders.length} TOTAL
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Reminder
        </button>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {['pending', 'completed', 'dismissed', ''].map(s => (
          <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />LOADING REMINDERS...</div>
      ) : reminders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Bell size={48} /></div>
          <div className="empty-title">NO REMINDERS</div>
          <div className="empty-sub">Set reminders for upcoming service, renewals, and more</div>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add Reminder
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reminders.map(r => (
            <div key={r.id} className="card card-sm" style={{
              borderLeftWidth: '3px',
              borderLeftColor: r.is_overdue ? 'var(--danger)' : r.priority === 'critical' ? 'var(--danger)' : r.priority === 'high' ? 'var(--warning)' : r.priority === 'medium' ? 'var(--accent)' : 'var(--success)',
              opacity: r.status !== 'pending' ? 0.6 : 1,
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-12" style={{ flex: 1, minWidth: 0 }}>
                  <span className={`priority-dot ${r.priority}`} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-8 flex-wrap">
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{r.title}</span>
                      <span className={`badge ${PRIORITY_BADGE[r.priority]}`}>{r.priority}</span>
                      {r.is_overdue && <span className="badge badge-danger"><AlertTriangle size={10} style={{ display: 'inline' }} /> OVERDUE</span>}
                      {!r.is_overdue && r.days_until_due !== null && r.days_until_due <= 7 && r.status === 'pending' && (
                        <span className="badge badge-warning"><Clock size={10} style={{ display: 'inline' }} /> {r.days_until_due}d</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {r.year} {r.make} {r.model}
                      </span>
                      {r.due_date && (
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          Due: {format(parseISO(r.due_date), 'dd MMM yyyy')}
                          {r.days_until_due !== null && r.status === 'pending' && (
                            <span style={{ color: r.is_overdue ? 'var(--danger)' : r.days_until_due <= 30 ? 'var(--warning)' : 'var(--text-dim)' }}>
                              {' '}({r.is_overdue ? `${Math.abs(r.days_until_due)}d ago` : `in ${r.days_until_due}d`})
                            </span>
                          )}
                        </span>
                      )}
                      {r.due_odometer && (
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          At: {Number(r.due_odometer).toLocaleString('en-IN')} km
                          {r.current_odometer && (
                            <span style={{ color: 'var(--text-dim)' }}>
                              {' '}({r.due_odometer > r.current_odometer
                                ? `${Number(r.due_odometer - r.current_odometer).toLocaleString('en-IN')} km left`
                                : `${Number(r.current_odometer - r.due_odometer).toLocaleString('en-IN')} km past`})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {r.description && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{r.description}</div>}
                  </div>
                </div>

                <div className="flex gap-8 items-center" style={{ flexShrink: 0, marginLeft: '12px' }}>
                  {r.status === 'pending' && (
                    <>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                        onClick={() => updateStatus(r.id, 'completed')} title="Mark complete">
                        <Check size={13} /> Done
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => updateStatus(r.id, 'dismissed')} title="Dismiss">
                        <X size={13} />
                      </button>
                    </>
                  )}
                  {r.status !== 'pending' && (
                    <span className={`badge ${r.status === 'completed' ? 'badge-success' : 'badge-dim'}`}>
                      {r.status}
                    </span>
                  )}
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="ADD REMINDER">
        {vehicles.length > 0 ? (
          <ReminderForm vehicles={vehicles} onSave={handleSave} onCancel={() => setShowModal(false)} loading={saving} />
        ) : (
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)' }}>Please add a vehicle first before creating reminders.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
