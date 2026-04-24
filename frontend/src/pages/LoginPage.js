import React, { useState } from 'react';
import { authAPI } from '../utils/api';

export default function LoginPage({ onLogin }) {
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register({ name: form.name, email: form.email, password: form.password });

      localStorage.setItem('garageiq_token', res.token);
      localStorage.setItem('garageiq_user', JSON.stringify(res.user));
      onLogin(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(249,115,22,0.06) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(34,211,238,0.04) 0%, transparent 40%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>

      {/* Decorative grid lines */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--accent)' }}>
              <path d="M4 20L8 8h12l4 12H4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="9" cy="21" r="2.5" fill="currentColor"/>
              <circle cx="19" cy="21" r="2.5" fill="currentColor"/>
              <path d="M7 14h14" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              letterSpacing: '3px',
              color: 'var(--accent)',
              lineHeight: 1,
            }}>
              GARAGE<span style={{ color: 'var(--text-primary)' }}>IQ</span>
            </span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '4px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
          }}>
            Vehicle Maintenance System
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-bright)',
          borderRadius: '8px',
          padding: '36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(249,115,22,0.06)',
        }}>

          {/* Mode tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            marginBottom: '28px',
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${mode === m ? 'var(--accent)' : 'transparent'}`,
                  marginBottom: '-1px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: mode === m ? 'var(--accent)' : 'var(--text-dim)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Arjun Sharma"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '4px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--danger)',
                letterSpacing: '0.5px',
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', letterSpacing: '1px', marginTop: '4px' }}
            >
              {loading
                ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Processing...</>
                : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'
              }
            </button>
          </form>

          {/* Demo credentials hint */}
          {mode === 'login' && (
            <div style={{
              marginTop: '24px',
              padding: '12px 14px',
              background: 'rgba(249,115,22,0.06)',
              border: '1px solid rgba(249,115,22,0.15)',
              borderRadius: '4px',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '2px', marginBottom: '6px' }}>
                DEMO CREDENTIALS
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                <span style={{ color: 'var(--text-dim)' }}>Email: </span>admin@garageiq.com<br />
                <span style={{ color: 'var(--text-dim)' }}>Pass: &nbsp;</span>Admin@123
              </div>
              <button
                type="button"
                style={{
                  marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)',
                  letterSpacing: '1px', padding: 0, textDecoration: 'underline',
                }}
                onClick={() => setForm(f => ({ ...f, email: 'admin@garageiq.com', password: 'Admin@123' }))}
              >
                Auto-fill →
              </button>
            </div>
          )}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-dim)',
          letterSpacing: '2px',
        }}>
          GARAGEIQ v1.0 · SECURE LOGIN
        </div>
      </div>
    </div>
  );
}
