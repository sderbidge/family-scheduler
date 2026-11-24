import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, Clock, Tag } from 'lucide-react';
import { getEvents, deleteEvent } from '../api';

const CATEGORIES = ['general', 'school', 'work', 'sports', 'health', 'social', 'other'];

export default function EventList({ members, onAdd, onEdit }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { events: ev } = await getEvents({
        search: search || undefined,
        member_id: filterMember || undefined,
        category: filterCategory || undefined,
      });
      setEvents(ev);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, filterMember, filterCategory]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      setEvents(ev => ev.filter(e => e.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  // Group by date
  const grouped = {};
  events.forEach(ev => {
    if (!grouped[ev.date]) grouped[ev.date] = [];
    grouped[ev.date].push(ev);
  });
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events…"
            style={{ width: '100%', paddingLeft: 32, ...inputStyle }}
          />
        </div>
        <select value={filterMember} onChange={e => setFilterMember(e.target.value)} style={inputStyle}>
          <option value="">All members</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={inputStyle}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <button onClick={() => onAdd()} style={addBtnStyle}>
          <Plus size={16} /> Add Event
        </button>
      </div>

      {loading && <p style={{ color: '#94a3b8' }}>Loading…</p>}

      {!loading && sortedDates.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <p style={{ fontSize: 16 }}>No events found.</p>
          <button onClick={() => onAdd()} style={addBtnStyle}>+ Add your first event</button>
        </div>
      )}

      {sortedDates.map(date => (
        <div key={date} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', marginBottom: 8 }}>
            {formatDate(date)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {grouped[date].map(ev => (
              <EventRow key={ev.id} event={ev} onEdit={onEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EventRow({ event, onEdit, onDelete }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderLeft: `4px solid ${event.member_color || '#6366f1'}`,
      borderRadius: 8,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{event.title}</div>
        {event.description && (
          <div style={{ fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.description}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
          {event.start_time && (
            <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={12} /> {event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}
            </span>
          )}
          {event.member_name && (
            <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: event.member_color || '#6366f1',
                display: 'inline-block'
              }} />
              {event.member_name}
            </span>
          )}
          {event.category && event.category !== 'general' && (
            <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Tag size={11} /> {event.category}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <IconBtn onClick={() => onEdit(event)} title="Edit"><Pencil size={15} /></IconBtn>
        <IconBtn onClick={() => onDelete(event.id)} title="Delete" danger><Trash2 size={15} /></IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ onClick, children, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'none',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: '5px 7px',
        cursor: 'pointer',
        color: danger ? '#ef4444' : '#64748b',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {children}
    </button>
  );
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const inputStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  outline: 'none',
  background: '#fff',
  color: '#1e293b',
};

const addBtnStyle = {
  background: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};
