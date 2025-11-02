const express = require('express');
const { getPool } = require('../utils/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

async function ownsCafe(userId, cafeId) {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT 1 FROM cafe_owners WHERE user_id = ? AND cafe_id = ? LIMIT 1', [userId, cafeId]);
  return rows.length > 0;
}

router.post('/menus', auth(true), async (req, res, next) => {
  try {
    const { cafe_id, name, category, price, description, photo_url, is_available } = req.body || {};
    if (!cafe_id || !name || price == null) return res.status(400).json({ message: 'Missing fields' });
    const ok = (req.user.role === 'admin') || await ownsCafe(req.user.id, Number(cafe_id));
    if (!ok) return res.status(403).json({ message: 'Forbidden' });
    const pool = await getPool();
    const [ret] = await pool.query(
      `INSERT INTO menus (cafe_id, name, category, price, description, photo_url, is_available, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [cafe_id, name, category || null, price, description || null, photo_url || null, is_available != null ? !!is_available : true]
    );
    const id = ret.insertId;
    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.put('/menus/:id', auth(true), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const menu = rows[0];
    const ok = (req.user.role === 'admin') || await ownsCafe(req.user.id, Number(menu.cafe_id));
    if (!ok) return res.status(403).json({ message: 'Forbidden' });

    const patch = req.body || {};
    const allowed = ['name','category','price','description','photo_url','is_available'];
    const sets = [], vals = [];
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(patch, k)) {
        sets.push(`${k} = ?`); vals.push(patch[k]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ message: 'No changes' });
    await pool.query(`UPDATE menus SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`, [...vals, id]);
    const [rows2] = await pool.query('SELECT * FROM menus WHERE id = ?', [id]);
    res.json(rows2[0]);
  } catch (e) { next(e); }
});

router.delete('/menus/:id', auth(true), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const menu = rows[0];
    const ok = (req.user.role === 'admin') || await ownsCafe(req.user.id, Number(menu.cafe_id));
    if (!ok) return res.status(403).json({ message: 'Forbidden' });
    await pool.query('DELETE FROM menus WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
