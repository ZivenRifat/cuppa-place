const { User, Cafe } = require('../models');

exports.myCafes = async (req, res, next) => {
  try {
    const rows = await Cafe.findAll({ where: { owner_id: req.user.id }, order: [['id', 'ASC']] });
    res.json({ data: rows });
  } catch (e) { next(e); }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    });
  } catch (e) { next(e); }
};
