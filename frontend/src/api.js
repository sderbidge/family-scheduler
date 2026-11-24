const BASE = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Members
export const getMembers = () => request('/members');
export const createMember = (data) => request('/members', { method: 'POST', body: JSON.stringify(data) });
export const updateMember = (id, data) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMember = (id) => request(`/members/${id}`, { method: 'DELETE' });

// Events
export const getEvents = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(`/events${qs ? '?' + qs : ''}`);
};
export const getEvent = (id) => request(`/events/${id}`);
export const createEvent = (data) => request('/events', { method: 'POST', body: JSON.stringify(data) });
export const updateEvent = (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEvent = (id) => request(`/events/${id}`, { method: 'DELETE' });

// Stats
export const getStats = () => request('/stats');
