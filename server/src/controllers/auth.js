const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { wrap, fail } = require('../utils');

const sign = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = ({ password_hash, ...u }) => u; // never expose the hash

exports.register = wrap(async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;
  if (!name || name.trim().length < 2) throw fail(400, 'Enter your full name');
  if (!/^\S+@\S+\.\S+$/.test(email || '')) throw fail(400, 'Enter a valid email address');
  if (!/^\d{10}$/.test(phone || '')) throw fail(400, 'Phone number must be 10 digits');
  if (!password || password.length < 6) throw fail(400, 'Password must be at least 6 characters');
  if (password !== confirmPassword) throw fail(400, 'Passwords do not match');

  const mail = email.trim().toLowerCase();
  const [[exists]] = await db.query('SELECT id FROM users WHERE email = ?', [mail]);
  if (exists) throw fail(409, 'An account with this email already exists');

  const hash = await bcrypt.hash(password, 10);
  const [r] = await db.query(
    "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'student')",
    [name.trim(), mail, phone, hash]);
  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [r.insertId]);
  res.status(201).json({ token: sign(user), user: pub(user) });
});

exports.login = wrap(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw fail(400, 'Enter your email and password');
  const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw fail(401, 'Incorrect email or password');
  if (!user.is_active) throw fail(403, 'Your account has been deactivated');
  res.json({ token: sign(user), user: pub(user) });
});

exports.me = (req, res) => res.json({ user: req.user });
