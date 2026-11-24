import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, List, Users, BarChart2, Menu, X } from 'lucide-react';
import CalendarView from './components/CalendarView';
import EventList from './components/EventList';
import MembersPanel from './components/MembersPanel';
import StatsPanel from './components/StatsPanel';
import EventModal from './components/EventModal';
import { getMembers } from './api';

const NAV = [
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { id: 'list',     label: 'Events',   Icon: List },
  { id: 'members',  label: 'Family',   Icon: Users },
  { id: 'stats',    label: 'Stats',    Icon: BarChart2 },
];

export default function App() {
  const [view, setView] = useState('calendar');
  const [members, setMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMembers = useCallback(async () => {
    try {
      const { members: m } = await getMembers();
      setMembers(m);
    } catch (e) {
      console.error('Failed to load members', e);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const openCreate = (date = null) => {
    setEditingEvent(null);
    setDefaultDate(date);
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setDefaultDate(null);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    setRefreshKey(k => k + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: '#fff',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CalendarDays size={24} />
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Family Scheduler
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => openCreate()}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 16px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            + Add Event
          </button>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar nav */}
        <nav style={{
          width: sidebarOpen ? 200 : 64,
          background: '#1e293b',
          transition: 'width 0.2s',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 12,
        }}>
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setView(id); setSidebarOpen(false); }}
              title={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                background: view === id ? 'rgba(99,102,241,0.3)' : 'transparent',
                border: 'none',
                color: view === id ? '#a5b4fc' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: view === id ? '3px solid #6366f1' : '3px solid transparent',
                fontWeight: view === id ? 600 : 400,
                fontSize: 14,
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {view === 'calendar' && (
            <CalendarView
              key={refreshKey}
              members={members}
              onAddEvent={openCreate}
              onEditEvent={openEdit}
            />
          )}
          {view === 'list' && (
            <EventList
              key={refreshKey}
              members={members}
              onAdd={openCreate}
              onEdit={openEdit}
            />
          )}
          {view === 'members' && (
            <MembersPanel
              key={refreshKey}
              members={members}
              onChanged={loadMembers}
            />
          )}
          {view === 'stats' && (
            <StatsPanel key={refreshKey} />
          )}
        </main>
      </div>

      {modalOpen && (
        <EventModal
          event={editingEvent}
          defaultDate={defaultDate}
          members={members}
          onSave={handleSaved}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
