const { User, Cafe } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../middlewares/auth');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already used' });

    const password_hash = await hashPassword(password);
    const user = await User.create({ name, email, phone, password_hash, role: 'user' });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id','name','email','phone','role','avatar_url','created_at','updated_at'],
    });
    res.json({ user });
  } catch (e) { next(e); }
};

exports.registerMitra = async (req, res, next) => {
  try {
    const {
      name, email, password, phone,
      cafe_name, address, lat, lng, instagram,
    } = req.body || {};

    if (!name || !email || !password || !cafe_name) {
      return res.status(400).json({ message: 'name, email, password, cafe_name required' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already used' });

    const password_hash = await hashPassword(password);
    const user = await User.create({ name, email, phone, password_hash, role: 'mitra' });
    const cafe = await Cafe.create({
      owner_id: user.id,
      name: cafe_name,
      address: address || null,
      lat: lat ?? null,
      lng: lng ?? null,
      instagram: instagram || null,
      is_active: true,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      cafe,
    });
  } catch (e) { next(e); }
};