const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool } = require('../utils/db');
const { signToken, auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const pool = await getPool();
    const [dup] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (dup.length > 0) return res.status(409).json({ message: 'Email already used' });
    const hash = await bcrypt.hash(password, 10);
    const [ret] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [name, email, hash, phone || null, 'user']
    );
    const id = ret.insertId;
    const user = { id, name, email, phone, role: 'user' };
    const token = signToken(user);
    res.json({ token, user });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const user = { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role };
    const token = signToken(user);
    res.json({ token, user });
  } catch (e) { next(e); }
});

router.get('/me', auth(true), async (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', auth(true), async (req, res) => {
  res.status(204).send();
});

module.exports = router;
