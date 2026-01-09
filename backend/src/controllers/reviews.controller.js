const { Review, Cafe, User } = require('../models');

exports.listForCafe = async (req, res, next) => {
  try {
    const cafe_id = req.params.id;
    const { rating, limit = 20, offset = 0, status } = req.query;
    const where = { cafe_id, is_live_comment: false }; // Exclude live comments from regular reviews
    if (rating) where.rating = Number(rating);
    if (status) where.status = status;
    const rows = await Review.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['id', 'DESC']],
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar_url']
      }]
    });

    // Transform data to include author info in expected format
    const data = rows.map(r => ({
      id: r.id,
      cafe_id: r.cafe_id,
      user_id: r.user_id,
      rating: r.rating,
      comment: r.text || r.comment,
      text: r.text || r.comment,
      image_url: r.image_url,
      status: r.status,
      is_live_comment: r.is_live_comment,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
      user: r.author ? {
        id: r.author.id,
        name: r.author.name,
        avatar_url: r.author.avatar_url
      } : null,
      author: r.author ? r.author.name : 'Anonim',
      avatar: r.author?.avatar_url || null
    }));

    res.json({ total: rows.length, data });
  } catch (e) { next(e); }
};

// Get reviews by user (for profile page)
exports.listByUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { limit = 10, offset = 0 } = req.query;

    const rows = await Review.findAll({
      where: {
        user_id: userId,
        is_live_comment: false // Exclude live comments from regular reviews
      },
      limit: Number(limit),
      offset: Number(offset),
      order: [['id', 'DESC']],
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: ['id', 'name']
      }, {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar_url']
      }]
    });

    // Transform data
    const data = rows.map(r => ({
      id: r.id,
      cafe_id: r.cafe_id,
      rating: r.rating,
      comment: r.text || r.comment,
      text: r.text || r.comment,
      image_url: r.image_url,
      status: r.status,
      created_at: r.createdAt,
      cafe: r.cafe ? {
        id: r.cafe.id,
        name: r.cafe.name
      } : null,
      user: r.author ? {
        id: r.author.id,
        name: r.author.name,
        avatar_url: r.author.avatar_url
      } : null,
      author: r.author ? r.author.name : 'Anonim',
      avatar: r.author?.avatar_url || null
    }));

    res.json({ total: rows.length, data });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const cafe_id = req.params.id;
    const { rating, text, image_url } = req.body || {};
    if (!rating) return res.status(400).json({ message: 'rating required' });
    const cafe = await Cafe.findByPk(cafe_id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });
    const row = await Review.create({
      cafe_id,
      user_id: req.user?.id ?? null,
      rating: Number(rating),
      text: text || null,
      image_url: image_url || null,
      status: 'published',
    });
    res.status(201).json(row);
  } catch (e) { next(e); }
};

// Create a live comment (without rating, for chat-like functionality)
exports.createLiveComment = async (req, res, next) => {
  try {
    const cafe_id = req.params.id;
    const { text, image_url } = req.body || {};

    if (!text && !image_url) {
      return res.status(400).json({ message: 'text or image_url required' });
    }

    const cafe = await Cafe.findByPk(cafe_id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });

    const row = await Review.create({
      cafe_id,
      user_id: req.user?.id ?? null,
      rating: 0, // Live comments don't have a rating
      text: text || null,
      image_url: image_url || null,
      status: 'published',
      is_live_comment: true, // Mark as live comment
    });

    res.status(201).json(row);
  } catch (e) { next(e); }
};

// Get only live comments for a cafe
exports.listLiveComments = async (req, res, next) => {
  try {
    const cafe_id = req.params.id;
    const { limit = 20, offset = 0 } = req.query;

    const rows = await Review.findAll({
      where: {
        cafe_id,
        is_live_comment: true
      },
      limit: Number(limit),
      offset: Number(offset),
      order: [['id', 'DESC']],
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar_url']
      }]
    });

    // Transform data to include author info in expected format
    const data = rows.map(r => ({
      id: r.id,
      cafe_id: r.cafe_id,
      user_id: r.user_id,
      rating: r.rating,
      comment: r.text || r.comment,
      text: r.text || r.comment,
      image_url: r.image_url,
      status: r.status,
      is_live_comment: r.is_live_comment,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
      user: r.author ? {
        id: r.author.id,
        name: r.author.name,
        avatar_url: r.author.avatar_url
      } : null,
      author: r.author ? r.author.name : 'Anonim',
      avatar: r.author?.avatar_url || null
    }));

    res.json({ total: rows.length, data });
  } catch (e) { next(e); }
};
