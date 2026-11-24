const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '..', '..', 'data', 'family.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      member_id INTEGER,
      category TEXT DEFAULT 'general',
      all_day INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES family_members(id) ON DELETE SET NULL
    )
  `);

  db.get('SELECT COUNT(*) as count FROM family_members', [], (err, row) => {
    if (!err && row.count === 0) {
      const members = [
        ['Mom', '#ec4899'],
        ['Dad', '#3b82f6'],
        ['Kid 1', '#10b981'],
        ['Kid 2', '#f59e0b'],
      ];
      const stmt = db.prepare('INSERT INTO family_members (name, color) VALUES (?, ?)');
      members.forEach(([name, color]) => stmt.run(name, color));
      stmt.finalize();
    }
  });
});

module.exports = db;
