const db = require('../db/database');

const getStats = (req, res, next) => {
  const today = new Date().toISOString().split('T')[0];

  db.get('SELECT COUNT(*) as total FROM events', [], (err, row) => {
    if (err) return next(err);
    const totalEvents = row.total;

    db.get('SELECT COUNT(*) as upcoming FROM events WHERE date >= ?', [today], (err, row) => {
      if (err) return next(err);
      const upcomingEvents = row.upcoming;

      db.all(
        `SELECT m.name, m.color, COUNT(e.id) as event_count
         FROM family_members m
         LEFT JOIN events e ON m.id = e.member_id
         GROUP BY m.id ORDER BY event_count DESC`,
        [],
        (err, byMember) => {
          if (err) return next(err);
          res.json({ totalEvents, upcomingEvents, byMember });
        }
      );
    });
  });
};

module.exports = { getStats };
