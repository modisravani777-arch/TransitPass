const db = require('../db');
const { wrap, fail } = require('../utils');
const { issuePass } = require('../passService');

const BASE = `
  SELECT a.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone, u.photo AS user_photo,
         r.name AS route_name, r.source, r.destination, pt.name AS pass_type_name, pt.duration_days,
         d.file_path AS document_path, d.original_name AS document_name,
         bp.id AS pass_id, bp.pass_number
  FROM applications a
  JOIN users u ON u.id = a.user_id
  JOIN routes r ON r.id = a.route_id
  JOIN pass_types pt ON pt.id = a.pass_type_id
  LEFT JOIN documents d ON d.application_id = a.id
  LEFT JOIN bus_passes bp ON bp.application_id = a.id`;

const findOne = async (id) => (await db.query(`${BASE} WHERE a.id = ?`, [id]))[0][0];

exports.create = wrap(async (req, res) => {
  const { routeId, passTypeId, startDate } = req.body;
  if (!req.file) throw fail(400, 'Upload your college ID or supporting document');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || '')) throw fail(400, 'Choose a valid start date');
  const [[route]] = await db.query('SELECT id FROM routes WHERE id = ? AND is_active = 1', [routeId]);
  const [[type]] = await db.query('SELECT id, price FROM pass_types WHERE id = ? AND is_active = 1', [passTypeId]);
  if (!route) throw fail(400, 'Selected route is not available');
  if (!type) throw fail(400, 'Selected pass type is not available');
  const [[{ past }]] = await db.query('SELECT ? < CURDATE() AS past', [startDate]);
  if (past) throw fail(400, 'Start date cannot be in the past');

  const [r] = await db.query(
    'INSERT INTO applications (user_id, route_id, pass_type_id, start_date, amount) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, route.id, type.id, startDate, type.price]); // price always comes from the DB
  await db.query('INSERT INTO documents (application_id, file_path, original_name) VALUES (?, ?, ?)',
    [r.insertId, req.file.filename, req.file.originalname]);
  res.status(201).json(await findOne(r.insertId));
});

exports.list = wrap(async (req, res) => {
  const where = [], args = [];
  if (req.user.role !== 'admin') { where.push('a.user_id = ?'); args.push(req.user.id); }
  if (req.query.status) { where.push('a.status = ?'); args.push(req.query.status); }
  if (req.query.q) {
    const q = `%${req.query.q}%`;
    where.push('(u.name LIKE ? OR u.email LIKE ? OR r.name LIKE ? OR a.id LIKE ?)');
    args.push(q, q, q, q);
  }
  const [rows] = await db.query(`${BASE} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY a.created_at DESC, a.id DESC`, args);
  res.json(rows);
});

exports.get = wrap(async (req, res) => {
  const app = await findOne(req.params.id);
  if (!app || (req.user.role !== 'admin' && app.user_id !== req.user.id)) throw fail(404, 'Application not found');
  const [payments] = await db.query('SELECT * FROM payments WHERE application_id = ? ORDER BY id DESC', [app.id]);
  res.json({ ...app, payment: payments[0] || null });
});

exports.approve = wrap(async (req, res) => {
  const app = await findOne(req.params.id);
  if (!app) throw fail(404, 'Application not found');
  if (app.status !== 'Pending') throw fail(400, `Application is already ${app.status}`);
  await db.query("UPDATE applications SET status = 'Approved', rejection_reason = NULL WHERE id = ?", [app.id]);
  if (app.payment_status === 'Paid') await issuePass(app.id);
  res.json(await findOne(app.id));
});

exports.reject = wrap(async (req, res) => {
  const reason = (req.body.reason || '').trim();
  if (reason.length < 5) throw fail(400, 'Give a rejection reason (at least 5 characters)');
  const app = await findOne(req.params.id);
  if (!app) throw fail(404, 'Application not found');
  if (app.status !== 'Pending') throw fail(400, `Application is already ${app.status}`);
  await db.query("UPDATE applications SET status = 'Rejected', rejection_reason = ? WHERE id = ?", [reason, app.id]);
  res.json(await findOne(app.id));
});
