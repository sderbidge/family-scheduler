const db = require('../db/database');

const getAll = () =>
  new Promise((resolve, reject) =>
    db.all('SELECT * FROM family_members ORDER BY id', [], (err, rows) =>
      err ? reject(err) : resolve(rows)
    )
  );

const getById = (id) =>
  new Promise((resolve, reject) =>
    db.get('SELECT * FROM family_members WHERE id = ?', [id], (err, row) =>
      err ? reject(err) : resolve(row)
    )
  );

const create = ({ name, color, avatar }) =>
  new Promise((resolve, reject) =>
    db.run(
      'INSERT INTO family_members (name, color, avatar) VALUES (?, ?, ?)',
      [name, color || '#6366f1', avatar || null],
      function (err) {
        err ? reject(err) : resolve({ id: this.lastID, name, color: color || '#6366f1' });
      }
    )
  );

const update = (id, fields) => {
  const allowed = ['name', 'color', 'avatar'];
  const updates = [];
  const params = [];
  allowed.forEach(f => {
    if (fields[f] !== undefined) { updates.push(`${f} = ?`); params.push(fields[f]); }
  });
  if (updates.length === 0) return Promise.reject(new Error('No fields to update'));
  params.push(id);
  return new Promise((resolve, reject) =>
    db.run(`UPDATE family_members SET ${updates.join(', ')} WHERE id = ?`, params, function (err) {
      if (err) return reject(err);
      resolve(this.changes);
    })
  );
};

const remove = (id) =>
  new Promise((resolve, reject) =>
    db.run('DELETE FROM family_members WHERE id = ?', [id], function (err) {
      err ? reject(err) : resolve(this.changes);
    })
  );

module.exports = { getAll, getById, create, update, remove };
