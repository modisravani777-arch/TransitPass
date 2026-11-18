const db = require('../db');
const { wrap } = require('../utils');
const { STATE_SQL } = require('../passService');

exports.student = wrap(async (req, res) => {
  const id = req.user.id;
  const [[counts]] = await db.query(
    `SELECT COUNT(*) AS total, SUM(status = 'Pending') AS pending FROM applications WHERE user_id = ?`, [id]);
  const [[activePass]] = await db.query(
    `SELECT bp.id, bp.pass_number, ${STATE_SQL} AS status FROM bus_passes bp
     WHERE bp.user_id = ? HAVING status = 'Active' ORDER BY bp.valid_until DESC LIMIT 1`, [id]);
  const [recent] = await db.query(
    `SELECT a.id, a.status, a.payment_status, a.amount, a.created_at, a.updated_at, r.name AS route_name
     FROM applications a JOIN routes r ON r.id = a.route_id
     WHERE a.user_id = ? ORDER BY a.updated_at DESC LIMIT 5`, [id]);
  const [[latest]] = await db.query(
    `SELECT id, status, payment_status, created_at FROM applications WHERE user_id = ? ORDER BY id DESC LIMIT 1`, [id]);
  res.json({ total: counts.total, pending: Number(counts.pending || 0), activePass: activePass || null, recent, latest: latest || null });
});

exports.admin = wrap(async (req, res) => {
  const [[{ students }]] = await db.query("SELECT COUNT(*) AS students FROM users WHERE role = 'student'");
  const [[{ pending }]] = await db.query("SELECT COUNT(*) AS pending FROM applications WHERE status = 'Pending'");
  const [[{ activePasses }]] = await db.query('SELECT COUNT(*) AS activePasses FROM bus_passes WHERE CURDATE() BETWEEN valid_from AND valid_until');
  const [[{ revenue }]] = await db.query('SELECT COALESCE(SUM(amount), 0) AS revenue FROM payments');
  const [monthly] = await db.query(
    `SELECT DATE_FORMAT(created_at, '%b') AS label, DATE_FORMAT(created_at, '%Y-%m') AS ym, SUM(amount) AS total
     FROM payments GROUP BY ym, label ORDER BY ym DESC LIMIT 6`);
  const [byStatus] = await db.query('SELECT status, COUNT(*) AS count FROM applications GROUP BY status');
  const [topRoutes] = await db.query(
    `SELECT r.name, COUNT(*) AS count FROM applications a JOIN routes r ON r.id = a.route_id
     GROUP BY r.id, r.name ORDER BY count DESC LIMIT 4`);
  const [pendingList] = await db.query(
    `SELECT a.id, u.name AS user_name, r.name AS route_name, a.created_at
     FROM applications a JOIN users u ON u.id = a.user_id JOIN routes r ON r.id = a.route_id
     WHERE a.status = 'Pending' ORDER BY a.created_at DESC LIMIT 5`);
  res.json({ students, pending, activePasses, revenue: Number(revenue), monthly: monthly.reverse().map(m => ({ ...m, total: Number(m.total) })), byStatus, topRoutes, pendingList });
});

exports.notifications = wrap(async (req, res) => {
  if (req.user.role === 'admin') {
    const [rows] = await db.query(
      `SELECT a.id, a.updated_at AS at, CONCAT(u.name, ' applied for ', r.name) AS text
       FROM applications a JOIN users u ON u.id = a.user_id JOIN routes r ON r.id = a.route_id
       WHERE a.status = 'Pending' ORDER BY a.updated_at DESC LIMIT 5`);
    return res.json(rows);
  }
  const [rows] = await db.query(
    `SELECT a.id, a.updated_at AS at,
            CONCAT('Application #', a.id, ' (', r.name, ') is ', LOWER(a.status)) AS text
     FROM applications a JOIN routes r ON r.id = a.route_id
     WHERE a.user_id = ? ORDER BY a.updated_at DESC LIMIT 5`, [req.user.id]);
  res.json(rows);
});
