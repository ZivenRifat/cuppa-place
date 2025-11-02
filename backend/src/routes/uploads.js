const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { auth, requireCafeOwnerOrAdmin } = require('../middleware/auth');
const { getPool } = require('../utils/db');

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/uploads/image', auth(true), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

router.post('/cafes/:id/media', auth(true), requireCafeOwnerOrAdmin('id'), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'gallery[]' }
]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const files = req.files || {};
    const pool = await getPool();

    let logoUrl;
    if (files['logo'] && files['logo'][0]) {
      logoUrl = `/uploads/${files['logo'][0].filename}`;
      await pool.query('UPDATE cafes SET cover_url = ?, updated_at = NOW() WHERE id = ?', [logoUrl, id]);
    }

    let galleryUrls = [];
    if (files['gallery[]']) {
      const rows = files['gallery[]'].map(f => [id, `/uploads/${f.filename}`]);
      if (rows.length) {
        await pool.query('INSERT INTO cafe_photos (cafe_id, url) VALUES ' + rows.map(()=>'(?,?)').join(','), rows.flat());
        galleryUrls = rows.map(r => r[1]);
      }
    }

    res.json({ logo_url: logoUrl, gallery_urls: galleryUrls });
  } catch (e) { next(e); }
});

module.exports = router;
