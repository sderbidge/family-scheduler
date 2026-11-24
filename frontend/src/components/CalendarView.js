import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getEvents } from '../api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function isoDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarView({ members, onAddEvent, onEditEvent }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);

  const loadEvents = useCallback(async () => {
    const from = isoDate(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = isoDate(year, month, lastDay);
    try {
      const { events: ev } = await getEvents({ from, to });
      setEvents(ev);
    } catch (e) {
      console.error(e);
    }
  }, [year, month]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDate = {};
  events.forEach(ev => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  const todayStr = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
          {MONTHS[month]} {year}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <NavBtn onClick={prevMonth}><ChevronLeft size={18} /></NavBtn>
          <NavBtn onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}>
            Today
          </NavBtn>
          <NavBtn onClick={nextMonth}><ChevronRight size={18} /></NavBtn>
        </div>
      </div>

      {/* Grid header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: '#64748b', padding: '6px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          const dateStr = day ? isoDate(year, month, day) : null;
          const dayEvents = dateStr ? (eventsByDate[dateStr] || []) : [];
          const isToday = dateStr === todayStr;

          return (
            <div
              key={i}
              onClick={() => day && onAddEvent(dateStr)}
              style={{
                minHeight: 90,
                background: day ? '#fff' : '#f8fafc',
                border: isToday ? '2px solid #6366f1' : '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 6,
                cursor: day ? 'pointer' : 'default',
                transition: 'box-shadow 0.1s',
              }}
              onMouseEnter={e => { if (day) e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              {day && (
                <>
                  <div style={{
                    fontWeight: isToday ? 700 : 400,
                    fontSize: 13,
                    color: isToday ? '#6366f1' : '#374151',
                    background: isToday ? '#ede9fe' : 'transparent',
                    borderRadius: '50%',
                    width: 24, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 4,
                  }}>
                    {day}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayEvents.slice(0, 3).map(ev => (
                      <EventChip
                        key={ev.id}
                        event={ev}
                        onClick={(e) => { e.stopPropagation(); onEditEvent(ev); }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span style={{ fontSize: 10, color: '#6b7280' }}>
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventChip({ event, onClick }) {
  return (
    <div
      onClick={onClick}
      title={event.title}
      style={{
        background: event.member_color || '#6366f1',
        color: '#fff',
        borderRadius: 4,
        padding: '2px 5px',
        fontSize: 11,
        fontWeight: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
    >
      {event.start_time && (
        <span style={{ opacity: 0.85, marginRight: 3 }}>{event.start_time.slice(0, 5)}</span>
      )}
      {event.title}
    </div>
  );
}

function NavBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '5px 10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 13,
        fontWeight: 500,
        color: '#374151',
      }}
    >
      {children}
    </button>
  );
}
