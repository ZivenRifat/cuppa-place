const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, User, Cafe } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


async function registerMitra(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      name,
      email,
      password,
      phone,
      cafe_name,
      address,
      lat,
      lng,
      instagram,
    } = req.body || {};

    if (!name || !email || !password || !cafe_name) {
      return res.status(400).json({ message: 'Data tidak lengkap.' });
    }

    const existed = await User.findOne({ where: { email } });
    if (existed) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create(
      {
        name,
        email,
        password_hash: hash,
        phone: phone || null,
        role: 'mitra',
      },
      { transaction: t }
    );

    // cafe milik user tsb
    const cafe = await Cafe.create(
      {
        name: cafe_name,
        address: address || null,
        lat: lat ?? null,
        lng: lng ?? null,
        instagram: instagram || null,
        owner_id: user.id,
      },
      { transaction: t }
    );

    await t.commit();

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      cafe: {
        id: cafe.id,
        name: cafe.name,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error('registerMitra error:', err);
    return res.status(500).json({ message: 'Gagal mendaftarkan mitra.' });
  }
}

async function getMitraDashboard(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const cafes = await Cafe.findAll({ where: { owner_id: userId } });

    const metrics = {
      daily_sales: 120,
      monthly_sales: 450,
      avg_rating: 4.5,
      review_count: 320,
      favorites: 89,
      series_daily: [
        { name: 'Senin', value: 30 },
        { name: 'Selasa', value: 50 },
        { name: 'Rabu', value: 35 },
        { name: 'Kamis', value: 55 },
        { name: 'Jumat', value: 45 },
        { name: 'Sabtu', value: 60 },
        { name: 'Minggu', value: 60 },
      ],
    };

    return res.json({
      cafes: cafes.map(c => ({
        id: c.id,
        name: c.name,
        address: c.address,
      })),
      metrics,
    });
  } catch (err) {
    console.error('getMitraDashboard error:', err);
    return res.status(500).json({ message: 'Gagal memuat dashboard.' });
  }
}

module.exports = {
  registerMitra,
  getMitraDashboard,
};
