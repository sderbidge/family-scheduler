import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createEvent, updateEvent } from '../api';

const CATEGORIES = ['general', 'school', 'work', 'sports', 'health', 'social', 'other'];

const empty = {
  title: '',
  description: '',
  date: '',
  start_time: '',
  end_time: '',
  member_id: '',
  category: 'general',
  all_day: false,
};

export default function EventModal({ event, defaultDate, members, onSave, onClose }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        member_id: event.member_id != null ? String(event.member_id) : '',
        category: event.category || 'general',
        all_day: Boolean(event.all_day),
      });
    } else {
      setForm({ ...empty, date: defaultDate || new Date().toISOString().split('T')[0] });
    }
  }, [event, defaultDate]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.date) { setError('Date is required'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        member_id: form.member_id ? parseInt(form.member_id, 10) : null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      };
      if (event) {
        await updateEvent(event.id, payload);
      } else {
        await createEvent(payload);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Field label="Title *">
            <input
              autoFocus
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Event title"
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional details"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Date *">
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Category">
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input
              type="checkbox"
              id="all_day"
              checked={form.all_day}
              onChange={e => set('all_day', e.target.checked)}
            />
            <label htmlFor="all_day" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>All day</label>
          </div>

          {!form.all_day && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Start time">
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => set('start_time', e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="End time">
                <input
                  type="time"
                  value={form.end_time}
                  onChange={e => set('end_time', e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>
          )}

          <Field label="Family member">
            <select value={form.member_id} onChange={e => set('member_id', e.target.value)} style={inputStyle}>
              <option value="">No specific member</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </Field>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={saving} style={saveBtnStyle}>
              {saving ? 'Saving…' : event ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(15,23,42,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
};

const modalStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: 24,
  width: '100%',
  maxWidth: 480,
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const inputStyle = {
  width: '100%',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 13,
  outline: 'none',
  background: '#fff',
  color: '#1e293b',
};

const saveBtnStyle = {
  background: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '9px 20px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
};

const cancelBtnStyle = {
  background: '#f1f5f9',
  color: '#374151',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '9px 20px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: 13,
};
