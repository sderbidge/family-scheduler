const db = require('../db/database');

const getAll = ({ member_id, category, from, to, search } = {}) => {
  let query = `
    SELECT e.*, m.name as member_name, m.color as member_color
    FROM events e
    LEFT JOIN family_members m ON e.member_id = m.id
    WHERE 1=1
  `;
  const params = [];
  if (member_id) { query += ' AND e.member_id = ?'; params.push(member_id); }
  if (category)  { query += ' AND e.category = ?';  params.push(category); }
  if (from)      { query += ' AND e.date >= ?';      params.push(from); }
  if (to)        { query += ' AND e.date <= ?';      params.push(to); }
  if (search)    {
    query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY e.date ASC, e.start_time ASC';

  return new Promise((resolve, reject) =>
    db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows))
  );
};

const getById = (id) =>
  new Promise((resolve, reject) =>
    db.get(
      `SELECT e.*, m.name as member_name, m.color as member_color
       FROM events e LEFT JOIN family_members m ON e.member_id = m.id
       WHERE e.id = ?`,
      [id],
      (err, row) => err ? reject(err) : resolve(row)
    )
  );

const create = ({ title, description, date, start_time, end_time, member_id, category, all_day }) =>
  new Promise((resolve, reject) =>
    db.run(
      `INSERT INTO events (title, description, date, start_time, end_time, member_id, category, all_day)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', date, start_time || null, end_time || null,
       member_id || null, category || 'general', all_day ? 1 : 0],
      function (err) {
        err ? reject(err) : resolve({ id: this.lastID, title, date, start_time, end_time, member_id, category });
      }
    )
  );

const update = (id, fields) => {
  const allowed = ['title', 'description', 'date', 'start_time', 'end_time', 'member_id', 'category', 'all_day'];
  const updates = [];
  const params = [];
  allowed.forEach(f => {
    if (fields[f] !== undefined) {
      updates.push(`${f} = ?`);
      params.push(f === 'all_day' ? (fields[f] ? 1 : 0) : fields[f]);
    }
  });
  if (updates.length === 0) return Promise.reject(new Error('No fields to update'));
  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);
  return new Promise((resolve, reject) =>
    db.run(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, params, function (err) {
      err ? reject(err) : resolve(this.changes);
    })
  );
};

const remove = (id) =>
  new Promise((resolve, reject) =>
    db.run('DELETE FROM events WHERE id = ?', [id], function (err) {
      err ? reject(err) : resolve(this.changes);
    })
  );

module.exports = { getAll, getById, create, update, remove };
