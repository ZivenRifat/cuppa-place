const { Op } = require('sequelize');
const { Cafe, Menu } = require('../models');

function haversine(lat1, lon1, lat2, lon2) {
  function toRad(v){ return (v * Math.PI) / 180; }
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.list = async (req, res, next) => {
  try {
    const { search, lat, lng, radius = 0, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }
    const rows = await Cafe.findAll({ where, limit: Number(limit), offset: Number(offset), order: [['id','ASC']] });
    let data = rows.map(r => r.toJSON());

    if (lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
      const R = Number(radius) || 0;
      data = data.map(d => {
        const has = d.lat != null && d.lng != null;
        const dist = has ? haversine(Number(lat), Number(lng), Number(d.lat), Number(d.lng)) : null;
        return { ...d, distance_m: dist };
      });
      if (R > 0) data = data.filter(d => d.distance_m != null && d.distance_m <= R);
      data.sort((a,b) => (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity));
    }

    res.json({ data });
  } catch (e) { next(e); }
};

exports.detail = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });
    res.json(cafe);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });
    if (req.user.role !== 'admin' && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const allowed = ['name','description','address','lat','lng','instagram','opening_hours','cover_url','logo_url','phone'];
    for (const k of allowed) if (req.body[k] !== undefined) cafe[k] = req.body[k];
    await cafe.save();
    res.json(cafe);
  } catch (e) { next(e); }
};

exports.menu = async (req, res, next) => {
  try {
    const rows = await Menu.findAll({ where: { cafe_id: req.params.id }, order: [['id','ASC']] });
    res.json({ data: rows });
  } catch (e) { next(e); }
};