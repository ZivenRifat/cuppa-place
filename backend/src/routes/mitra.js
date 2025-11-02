const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool } = require('../utils/db');
const { signToken, auth, requireRole } = require('../middleware/auth');

const router = express.Router();

async function registerMitraHandler(req, res, next) {
  try {
    const { name, email, password, phone, cafe_name, address, lat, lng, instagram, opening_hours } = req.body || {};
    if (!name || !email || !password || !cafe_name) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const pool = await getPool();
    const [dup] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (dup.length > 0) return res.status(409).json({ message: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [uRes] = await conn.query(
        'INSERT INTO users (name, email, password_hash, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [name, email, hash, phone || null, 'mitra']
      );
      const userId = uRes.insertId;

      const [cRes] = await conn.query(
        'INSERT INTO cafes (name, description, address, lat, lng, instagram, opening_hours, cover_url, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [cafe_name, null, address || null, lat ?? null, lng ?? null, instagram || null, opening_hours ? JSON.stringify(opening_hours) : null, null, phone || null]
      );
      const cafeId = cRes.insertId;

      await conn.query(
        'INSERT INTO cafe_owners (user_id, cafe_id, created_at) VALUES (?, ?, NOW())',
        [userId, cafeId]
      );

      await conn.commit();

      const user = { id: userId, name, email, phone, role: 'mitra' };
      const token = signToken(user);
      res.json({ token, user });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) { next(e); }
}

router.post('/mitra/register', registerMitraHandler);
router.post('/auth/mitra/register', registerMitraHandler);

router.get('/mitra/dashboard', auth(true), requireRole('mitra','admin'), async (req, res, next) => {
  try {
    const pool = await getPool();
    let cafes = [];
    if (req.user.role === 'mitra') {
      const [rows] = await pool.query(
        `SELECT c.* FROM cafes c
         JOIN cafe_owners o ON o.cafe_id = c.id
         WHERE o.user_id = ?`, [req.user.id]);
      cafes = rows;
    } else {
      const [rows] = await pool.query('SELECT * FROM cafes ORDER BY id DESC LIMIT 20');
      cafes = rows;
    }

    const [menuCount] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM menus ${req.user.role==='mitra' ? 'WHERE cafe_id IN (SELECT cafe_id FROM cafe_owners WHERE user_id = ?)' : ''}`,
      req.user.role==='mitra' ? [req.user.id] : []
    );
    const [reviewAgg] = await pool.query(
      `SELECT COUNT(*) AS total, AVG(rating) AS avg FROM reviews ${req.user.role==='mitra' ? 'WHERE cafe_id IN (SELECT cafe_id FROM cafe_owners WHERE user_id = ?)' : ''}`,
      req.user.role==='mitra' ? [req.user.id] : []
    );
    const [favCount] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM favorites ${req.user.role==='mitra' ? 'WHERE cafe_id IN (SELECT cafe_id FROM cafe_owners WHERE user_id = ?)' : ''}`,
      req.user.role==='mitra' ? [req.user.id] : []
    );

    res.json({
      cafes,
      metrics: {
        menus: menuCount[0]?.cnt || 0,
        reviews: reviewAgg[0]?.total || 0,
        avgRating: Number(reviewAgg[0]?.avg || 0),
        favorites: favCount[0]?.cnt || 0
      },
      daily: [
        { name: 'Senin', value: 30 },
        { name: 'Selasa', value: 50 },
        { name: 'Rabu', value: 35 },
        { name: 'Kamis', value: 55 },
        { name: 'Jumat', value: 45 },
        { name: 'Sabtu', value: 60 },
        { name: 'Minggu', value: 60 },
      ]
    });
  } catch (e) { next(e); }
});

module.exports = router;
