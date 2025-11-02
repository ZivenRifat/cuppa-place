const express = require('express');
const { getPool } = require('../utils/db');
const { auth, requireCafeOwnerOrAdmin } = require('../middleware/auth');
const { distance } = require('../utils/haversine');

const router = express.Router();

router.get('/cafes', async (req, res, next) => {
  try {
    const { search, lat, lng, radius, limit = 50, offset = 0 } = req.query;
    const pool = await getPool();

    let sql = 'SELECT * FROM cafes';
    const params = [];
    if (search) {
      sql += ' WHERE name LIKE ? OR address LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await pool.query(sql, params);

    let data = rows;
    if (lat && lng) {
      const lat0 = parseFloat(lat);
      const lng0 = parseFloat(lng);
      data = rows.map(r => {
        if (r.lat != null && r.lng != null) {
          const d = distance(lat0, lng0, Number(r.lat), Number(r.lng));
          return { ...r, distance_m: Math.round(d) };
        }
        return r;
      });
      if (radius) {
        const m = parseFloat(radius);
        data = data.filter(r => typeof r.distance_m === 'number' ? r.distance_m <= m : true);
      }
      data.sort((a,b) => (a.distance_m || 0) - (b.distance_m || 0));
    }

    res.json({ data });
  } catch (e) { next(e); }
});

router.get('/cafes/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM cafes WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/cafes/:id/menu', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM menus WHERE cafe_id = ? ORDER BY id DESC', [id]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.put('/cafes/:id', auth(true), requireCafeOwnerOrAdmin('id'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const patch = req.body || {};
    const allowed = ['name','description','address','lat','lng','instagram','opening_hours','cover_url','phone'];
    const sets = [];
    const vals = [];
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(patch, k)) {
        if (k === 'opening_hours' && patch[k] != null && typeof patch[k] !== 'string') {
          sets.push(`${k} = ?`); vals.push(JSON.stringify(patch[k]));
        } else {
          sets.push(`${k} = ?`); vals.push(patch[k]);
        }
      }
    }
    if (sets.length === 0) return res.status(400).json({ message: 'No changes' });
    const pool = await getPool();
    await pool.query(`UPDATE cafes SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`, [...vals, id]);
    const [rows] = await pool.query('SELECT * FROM cafes WHERE id = ? LIMIT 1', [id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/cafes/:id/reviews', auth(true), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rating, limit = 20, offset = 0, status } = req.query;
    const pool = await getPool();
    const where = ['cafe_id = ?'];
    const params = [id];
    if (rating) { where.push('rating = ?'); params.push(Number(rating)); }
    if (status) { where.push('status = ?'); params.push(String(status)); }

    const [rows] = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS * FROM reviews WHERE ${where.join(' AND ')} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const [[{ 'FOUND_ROWS()': total }]] = await pool.query('SELECT FOUND_ROWS()');
    const [agg] = await pool.query('SELECT AVG(rating) AS avg FROM reviews WHERE cafe_id = ?', [id]);
    const [counts] = await pool.query('SELECT rating, COUNT(*) cnt FROM reviews WHERE cafe_id = ? GROUP BY rating', [id]);
    const map = {}; counts.forEach(r => { map[r.rating] = r.cnt; });

    res.json({ total, data: rows, avg: Number(agg[0]?.avg || 0), counts: map });
  } catch (e) { next(e); }
});

router.get('/cafes/:id/reports', auth(true), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { period = 'daily' } = req.query;
    let series = [];
    if (period === 'daily') {
      series = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map((name, i) => ({ name, value: [30,50,35,55,45,60,60][i] }));
    } else if (period === 'monthly') {
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      series = months.map((name, i) => ({ name, value: 100 + i * 5 }));
    } else {
      const years = [2020,2021,2022,2023,2024,2025,2026];
      series = years.map((y, i) => ({ name: String(y), value: 500 + i * 50 }));
    }
    res.json({ series, total: series.reduce((a,b)=>a+b.value,0) });
  } catch (e) { next(e); }
});

module.exports = router;
