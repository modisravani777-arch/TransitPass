const crypto = require('crypto');
const db = require('../db');
const { wrap, fail } = require('../utils');
const { issuePass } = require('../passService');

const METHODS = ['UPI', 'Card', 'Net Banking'];

// Simulated gateway: no real money moves, we just record a successful payment
exports.create = wrap(async (req, res) => {
  const { applicationId, method } = req.body;
  if (!METHODS.includes(method)) throw fail(400, 'Choose a payment method');
  const [[app]] = await db.query('SELECT * FROM applications WHERE id = ? AND user_id = ?', [applicationId, req.user.id]);
  if (!app) throw fail(404, 'Application not found');
  if (app.payment_status === 'Paid') throw fail(400, 'This application is already paid');
  if (app.status === 'Rejected') throw fail(400, 'Rejected applications cannot be paid');

  const txn = `TXN${Date.now()}${crypto.randomInt(100, 999)}`;
  await db.query(
    'INSERT INTO payments (application_id, user_id, amount, method, transaction_id) VALUES (?, ?, ?, ?, ?)',
    [app.id, req.user.id, app.amount, method, txn]);
  await db.query("UPDATE applications SET payment_status = 'Paid' WHERE id = ?", [app.id]);
  if (app.status === 'Approved') await issuePass(app.id);
  res.status(201).json({ transactionId: txn, amount: app.amount, method, applicationId: app.id });
});

exports.list = wrap(async (req, res) => {
  const mine = req.user.role !== 'admin';
  const [rows] = await db.query(
    `SELECT p.*, u.name AS user_name, r.name AS route_name, pt.name AS pass_type_name
     FROM payments p JOIN users u ON u.id = p.user_id
     JOIN applications a ON a.id = p.application_id
     JOIN routes r ON r.id = a.route_id JOIN pass_types pt ON pt.id = a.pass_type_id
     ${mine ? 'WHERE p.user_id = ?' : ''} ORDER BY p.created_at DESC, p.id DESC`, mine ? [req.user.id] : []);
  res.json(rows);
});
