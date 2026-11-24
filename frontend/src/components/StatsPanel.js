import React, { useState, useEffect } from 'react';
import { CalendarDays, TrendingUp, Users } from 'lucide-react';
import { getStats } from '../api';

export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(e => setError(e.message));
  }, []);

  if (error) return <p style={{ color: '#dc2626' }}>Failed to load stats: {error}</p>;
  if (!stats) return <p style={{ color: '#94a3b8' }}>Loading…</p>;

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        <KpiCard icon={<CalendarDays size={22} color="#6366f1" />} label="Total Events" value={stats.totalEvents} color="#ede9fe" />
        <KpiCard icon={<TrendingUp size={22} color="#10b981" />} label="Upcoming Events" value={stats.upcomingEvents} color="#d1fae5" />
        <KpiCard icon={<Users size={22} color="#3b82f6" />} label="Family Members" value={stats.byMember ? stats.byMember.length : 0} color="#dbeafe" />
      </div>

      {stats.byMember && stats.byMember.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#374151' }}>Events per Member</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.byMember.map((m, i) => {
              const max = Math.max(...stats.byMember.map(x => x.event_count), 1);
              const pct = Math.round((m.event_count / max) * 100);
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
                      {m.name}
                    </span>
                    <span style={{ fontWeight: 600 }}>{m.event_count}</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: m.color, height: '100%', borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ width: 42, height: 42, background: color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{value}</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
      </div>
    </div>
  );
}
