const { Favorite, Cafe } = require('../models');

// Helper functions for URL normalization (similar to cafes.controller.js)
function baseUrl(req) {
  // Use the same logic as cafes.controller.js
  const envBase = (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (envBase) return envBase;
  return `${req.protocol}://${req.get("host")}`;
}

function toPublicUrl(req, p) {
  if (!p) return null;

  // if already absolute URL, return as-is
  if (/^https?:\/\//i.test(p)) return p;

  const s = String(p).replace(/\\/g, "/");

  // handle paths with /uploads/
  const idx = s.lastIndexOf("/uploads/");
  const clean = idx >= 0 ? s.slice(idx) : s.startsWith("/") ? s : `/${s}`;

  return `${baseUrl(req)}${clean}`;
}

function normalizeCafe(req, cafeJson) {
  return {
    id: cafeJson.id,
    name: cafeJson.name,
    address: cafeJson.address,
    lat: cafeJson.lat,
    lng: cafeJson.lng,
    phone: cafeJson.phone,
    instagram: cafeJson.instagram,
    opening_hours: cafeJson.opening_hours,
    description: cafeJson.description,
    cover_url: cafeJson.cover_url ? toPublicUrl(req, cafeJson.cover_url) : null,
    logo_url: cafeJson.logo_url ? toPublicUrl(req, cafeJson.logo_url) : null,
  };
}

exports.listMine = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const rows = await Favorite.findAll({
      where: { user_id: userId },
      include: [{ model: Cafe, as: 'cafe' }],
      order: [['id', 'DESC']],
    });

    res.json(rows.map((r) => ({
      id: r.id,
      cafe: r.cafe ? normalizeCafe(req, r.cafe.toJSON()) : null,
    })));
  } catch (e) {
    next(e);
  }
};

exports.add = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const cafeId = Number(req.params.cafeId);
    if (!cafeId) return res.status(400).json({ message: 'cafeId invalid' });

    const [fav] = await Favorite.findOrCreate({
      where: { user_id: userId, cafe_id: cafeId },
    });

    res.status(201).json({ id: fav.id, cafe_id: cafeId });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const cafeId = Number(req.params.cafeId);
    if (!cafeId) return res.status(400).json({ message: 'cafeId invalid' });

    await Favorite.destroy({ where: { user_id: userId, cafe_id: cafeId } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
