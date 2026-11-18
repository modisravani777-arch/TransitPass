const QRCode = require('qrcode');
const db = require('../db');
const { wrap, fail } = require('../utils');
const { STATE_SQL } = require('../passService');

const BASE = `
  SELECT bp.*, ${STATE_SQL} AS status, u.name AS user_name, u.email AS user_email, u.photo AS user_photo,
         r.name AS route_name, r.source, r.destination, pt.name AS pass_type_name, pt.duration_days, a.amount
  FROM bus_passes bp
  JOIN users u ON u.id = bp.user_id
  JOIN applications a ON a.id = bp.application_id
  JOIN routes r ON r.id = a.route_id
  JOIN pass_types pt ON pt.id = a.pass_type_id`;

exports.list = wrap(async (req, res) => {
  const where = [], args = [];
  if (req.user.role !== 'admin') { where.push('bp.user_id = ?'); args.push(req.user.id); }
  if (req.query.q) {
    const q = `%${req.query.q}%`;
    where.push('(bp.pass_number LIKE ? OR u.name LIKE ?)');
    args.push(q, q);
  }
  const [rows] = await db.query(`${BASE} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY bp.issued_at DESC, bp.id DESC`, args);
  res.json(rows);
});

// Address phones open when they scan the QR. Priority: PUBLIC_URL (if it's not localhost) → the address the site is
// currently opened on (sent by the client) → PUBLIC_URL → CLIENT_URL. Lets a LAN address or a tunnel URL work with no config.
const isLocal = (u) => /\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(u);
const cleanUrl = (u) => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.origin : ''; } catch { return ''; } };
const baseUrl = (req) => {
  const env = cleanUrl(process.env.PUBLIC_URL || '');
  const seen = cleanUrl(req.get('x-app-origin') || '');
  if (env && !isLocal(env)) return env;
  if (seen && !isLocal(seen)) return seen;
  return env || seen || cleanUrl(process.env.CLIENT_URL || '') || 'http://localhost:5173';
};

exports.get = wrap(async (req, res) => {
  const [[pass]] = await db.query(`${BASE} WHERE bp.id = ?`, [req.params.id]);
  if (!pass || (req.user.role !== 'admin' && pass.user_id !== req.user.id)) throw fail(404, 'Pass not found');
  const verify_url = `${baseUrl(req)}/verify/${encodeURIComponent(pass.pass_number)}`;
  const qr = await QRCode.toDataURL(verify_url, { margin: 1, width: 320, color: { dark: '#0B1B3F', light: '#FFFFFF' } });
  res.json({ ...pass, qr, verify_url });
});

exports.verify = wrap(async (req, res) => {
  const [[pass]] = await db.query(`${BASE} WHERE bp.pass_number = ?`, [req.params.number.trim().toUpperCase()]);
  if (!pass) throw fail(404, 'No pass found with that number');
  res.json(pass);
});

// Public pass-details page, opened by scanning the QR with any phone camera / Google Lens or the in-app scanner.
// No login. Shows the pass itself; email, phone and payment transaction details are deliberately left out.
exports.publicVerify = wrap(async (req, res) => {
  const [[pass]] = await db.query(`${BASE} WHERE bp.pass_number = ?`, [req.params.number.trim().toUpperCase()]);
  if (!pass) throw fail(404, 'No pass found with that number');
  const { pass_number, application_id, status, user_name, user_photo, pass_type_name, duration_days, route_name,
          source, destination, amount, valid_from, valid_until, issued_at } = pass;
  res.json({ pass_number, application_id, status, user_name, user_photo, pass_type_name, duration_days, route_name,
             source, destination, amount, valid_from, valid_until, issued_at });
});