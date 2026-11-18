const jwt = require('jsonwebtoken');
const db = require('../db');
const { wrap, fail } = require('../utils');

exports.protect = wrap(async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) throw fail(401, 'Please log in to continue');
  let payload;
  try { payload = jwt.verify(h.slice(7), process.env.JWT_SECRET); }
  catch { throw fail(401, 'Session expired, please log in again'); }
  const [[user]] = await db.query(
    'SELECT id, name, email, phone, role, photo, is_active FROM users WHERE id = ?', [payload.id]);
  if (!user) throw fail(401, 'Account not found');
  if (!user.is_active) throw fail(403, 'Your account has been deactivated');
  req.user = user;
  next();
});

exports.adminOnly = (req, res, next) =>
  req.user.role === 'admin' ? next() : next(fail(403, 'Admin access only'));
