const db = require('../db');
const { wrap, fail } = require('../utils');

exports.updateProfile = wrap(async (req, res) => {
  const { name, phone } = req.body;
  if (name !== undefined && name.trim().length < 2) throw fail(400, 'Enter your full name');
  if (phone !== undefined && !/^\d{10}$/.test(phone)) throw fail(400, 'Phone number must be 10 digits');
  await db.query(
    'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), photo = COALESCE(?, photo) WHERE id = ?',
    [name?.trim() ?? null, phone ?? null, req.file?.filename ?? null, req.user.id]);
  const [[user]] = await db.query('SELECT id, name, email, phone, role, photo, is_active FROM users WHERE id = ?', [req.user.id]);
  res.json({ user });
});

exports.list = wrap(async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.photo, u.is_active, u.created_at,
            (SELECT COUNT(*) FROM applications WHERE user_id = u.id) AS applications
     FROM users u WHERE u.role = 'student' AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)
     ORDER BY u.created_at DESC`, [q, q, q]);
  res.json(rows);
});

exports.get = wrap(async (req, res) => {
  const [[user]] = await db.query(
    'SELECT id, name, email, phone, photo, is_active, created_at FROM users WHERE id = ? AND role = ?', [req.params.id, 'student']);
  if (!user) throw fail(404, 'Student not found');
  const [applications] = await db.query(
    `SELECT a.id, a.status, a.amount, a.created_at, r.name AS route_name, pt.name AS pass_type_name
     FROM applications a JOIN routes r ON r.id = a.route_id JOIN pass_types pt ON pt.id = a.pass_type_id
     WHERE a.user_id = ? ORDER BY a.created_at DESC`, [user.id]);
  res.json({ ...user, applications });
});

exports.setStatus = wrap(async (req, res) => {
  const [r] = await db.query("UPDATE users SET is_active = ? WHERE id = ? AND role = 'student'",
    [req.body.isActive ? 1 : 0, req.params.id]);
  if (!r.affectedRows) throw fail(404, 'Student not found');
  res.json({ ok: true });
});
