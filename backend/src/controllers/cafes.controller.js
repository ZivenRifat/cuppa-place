// backend/src/controllers/cafes.controller.js
const { Op, fn, col, literal } = require("sequelize");
const { Cafe, Menu, CafePhoto, Review } = require("../models");

function haversine(lat1, lon1, lat2, lon2) {
  function toRad(v) {
    return (v * Math.PI) / 180;
  }
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function baseUrl(req) {
  const envBase = (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (envBase) return envBase;
  return `${req.protocol}://${req.get("host")}`;
}

function toPublicUrl(req, p) {
  if (!p) return null;

  // kalau sudah absolute url, return as-is
  if (/^https?:\/\//i.test(p)) return p;

  const s = String(p).replace(/\\/g, "/");

  // kalau ada accidental absolute path yg mengandung /uploads/
  const idx = s.lastIndexOf("/uploads/");
  const clean = idx >= 0 ? s.slice(idx) : s.startsWith("/") ? s : `/${s}`;

  return `${baseUrl(req)}${clean}`;
}

function normalizeCafe(req, cafeJson, photos = []) {
  // Convert photo URLs to public URLs
  const gallery_urls = photos.map(p =>
    p.url ? toPublicUrl(req, p.url) : null
  ).filter(Boolean);

  // Parse opening_hours if it's a string (handle double-encoded JSON)
  let opening_hours = cafeJson.opening_hours;
  if (typeof opening_hours === "string") {
    try {
      // Try to parse - it might be a double-encoded JSON
      const firstParse = JSON.parse(opening_hours);
      if (typeof firstParse === "string") {
        // It was double-encoded, parse again
        opening_hours = JSON.parse(firstParse);
      } else {
        opening_hours = firstParse;
      }
    } catch (e) {
      // Keep as-is if parsing fails
      opening_hours = null;
    }
  }

  return {
    ...cafeJson,
    opening_hours,
    cover_url: cafeJson.cover_url ? toPublicUrl(req, cafeJson.cover_url) : null,
    logo_url: cafeJson.logo_url ? toPublicUrl(req, cafeJson.logo_url) : null,
    gallery_urls,
  };
}

// fallback converter kalau masih ada yg ngirim file.path
function toUploadsPath(p) {
  if (!p) return null;
  const s = String(p).replace(/\\/g, "/");

  const idx = s.lastIndexOf("/uploads/");
  if (idx >= 0) return s.slice(idx); // "/uploads/..."

  if (s.startsWith("uploads/")) return `/${s}`;
  if (s.startsWith("/uploads/")) return s;

  return null;
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

    const rows = await Cafe.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [["id", "ASC"]],
      logging: console.log, // Debug logging
    });

    // Get cafe IDs
    const cafeIds = rows.map(r => r.id);

    // Fetch all photos for these cafes
    const photos = await CafePhoto.findAll({
      where: { cafe_id: cafeIds },
      order: [["id", "ASC"]],
    });

    // Group photos by cafe_id
    const photosByCafe = photos.reduce((acc, photo) => {
      if (!acc[photo.cafe_id]) acc[photo.cafe_id] = [];
      acc[photo.cafe_id].push(photo);
      return acc;
    }, {});

    // Fetch ratings and review counts for all cafes (exclude live comments)
    const ratingStats = await Review.findAll({
      attributes: [
        "cafe_id",
        [fn("AVG", col("rating")), "avg_rating"],
        [fn("COUNT", col("id")), "review_count"],
      ],
      where: { cafe_id: cafeIds, is_live_comment: false },
      group: ["cafe_id"],
    });

    // Create a map for easy lookup
    const ratingMap = ratingStats.reduce((acc, r) => {
      acc[r.cafe_id] = {
        avg_rating: parseFloat(r.get("avg_rating")) || 0,
        review_count: parseInt(r.get("review_count")) || 0,
      };
      return acc;
    }, {});

    let data = rows.map((r) => {
      const cafeData = normalizeCafe(req, r.toJSON(), photosByCafe[r.id] || []);
      const stats = ratingMap[r.id] || { avg_rating: 0, review_count: 0 };
      return {
        ...cafeData,
        avg_rating: stats.avg_rating,
        review_count: stats.review_count,
      };
    });

    if (
      lat &&
      lng &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng))
    ) {
      const R = Number(radius) || 0;
      data = data.map((d) => {
        const has = d.lat != null && d.lng != null;
        const dist = has
          ? haversine(Number(lat), Number(lng), Number(d.lat), Number(d.lng))
          : null;
        return { ...d, distance_m: dist };
      });

      if (R > 0) {
        data = data.filter((d) => d.distance_m != null && d.distance_m <= R);
      }
      data.sort(
        (a, b) => (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity)
      );
    }

    res.json({ data });
  } catch (e) {
    console.error("list cafes error:", e);
    // Return empty data instead of error to prevent frontend crash
    res.json({ data: [] });
  }
};

exports.detail = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    // Fetch gallery photos
    const photos = await CafePhoto.findAll({
      where: { cafe_id: cafe.id },
      order: [["id", "ASC"]],
    });

    res.json(normalizeCafe(req, cafe.toJSON(), photos));
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowed = [
      "name",
      "description",
      "address",
      "lat",
      "lng",
      "instagram",
      "opening_hours",
      "cover_url",
      "logo_url",
      "phone",
    ];

    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        // Handle opening_hours: if it's a string, try to parse it as JSON
        if (k === "opening_hours" && typeof req.body[k] === "string") {
          try {
            cafe[k] = JSON.parse(req.body[k]);
          } catch (e) {
            // If parsing fails, keep the string as-is
            cafe[k] = req.body[k];
          }
        } else {
          cafe[k] = req.body[k];
        }
      }
    }

    await cafe.save();
    res.json(normalizeCafe(req, cafe.toJSON()));
  } catch (e) {
    next(e);
  }
};

exports.updateMedia = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const files = req.files || {};
    const coverFile = files.cover?.[0] || null;
    const logoFile = files.logo?.[0] || null;

    if (!coverFile && !logoFile) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ pakai filename (paling stabil)
    if (coverFile?.filename) {
      cafe.cover_url = `/uploads/covers/${coverFile.filename}`;
    } else if (coverFile?.path) {
      // fallback kalau ada yg beda
      const p = toUploadsPath(coverFile.path);
      if (!p) return res.status(500).json({ message: "Invalid cover path" });
      cafe.cover_url = p;
    }

    if (logoFile?.filename) {
      cafe.logo_url = `/uploads/logos/${logoFile.filename}`;
    } else if (logoFile?.path) {
      const p = toUploadsPath(logoFile.path);
      if (!p) return res.status(500).json({ message: "Invalid logo path" });
      cafe.logo_url = p;
    }

    await cafe.save();
    res.json(normalizeCafe(req, cafe.toJSON()));
  } catch (e) {
    next(e);
  }
};

exports.menu = async (req, res, next) => {
  try {
    const rows = await Menu.findAll({
      where: { cafe_id: req.params.id },
      order: [["id", "ASC"]],
    });
    res.json({ data: rows });
  } catch (e) {
    next(e);
  }
};

exports.reports = async (req, res, next) => {
  try {
    const { period = "daily" } = req.query;

    let series;
    if (period === "monthly") {
      series = [
        { name: "Jan", value: 120 },
        { name: "Feb", value: 140 },
        { name: "Mar", value: 160 },
        { name: "Apr", value: 180 },
      ];
    } else if (period === "yearly") {
      series = [
        { name: "2022", value: 1200 },
        { name: "2023", value: 1500 },
        { name: "2024", value: 1800 },
      ];
    } else {
      series = [
        { name: "Senin", value: 30 },
        { name: "Selasa", value: 45 },
        { name: "Rabu", value: 35 },
        { name: "Kamis", value: 50 },
        { name: "Jumat", value: 60 },
        { name: "Sabtu", value: 70 },
        { name: "Minggu", value: 55 },
      ];
    }

    const total = series.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
    res.json({ series, total });
  } catch (e) {
    next(e);
  }
};

// Upload gallery photos for a cafe
exports.uploadGallery = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const files = req.files || {};
    const photoFiles = files.photos || [];

    if (!photoFiles.length) {
      return res.status(400).json({ message: "No photos uploaded" });
    }

    // Create CafePhoto records for all uploaded photos (no limit)
    const createdPhotos = await Promise.all(photoFiles.map(file =>
      CafePhoto.create({
        cafe_id: cafe.id,
        url: `/uploads/gallery/${file.filename}`,
      })
    ));

    res.json({
      message: `Added ${createdPhotos.length} photo(s)`,
      photos: createdPhotos.map(p => ({
        id: p.id,
        url: toPublicUrl(req, p.url),
      })),
    });
  } catch (e) {
    next(e);
  }
};

// Delete a gallery photo
exports.deleteGalleryPhoto = async (req, res, next) => {
  try {
    const photo = await CafePhoto.findByPk(req.params.photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const cafe = await Cafe.findByPk(photo.cafe_id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await photo.destroy();
    res.json({ message: "Photo deleted" });
  } catch (e) {
    next(e);
  }
};

// Archive a gallery photo (soft delete - won't show in gallery)
exports.archiveGalleryPhoto = async (req, res, next) => {
  try {
    const photo = await CafePhoto.findByPk(req.params.photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const cafe = await Cafe.findByPk(photo.cafe_id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    photo.is_archived = true;
    await photo.save();

    res.json({ message: "Photo archived", photo: { id: photo.id, is_archived: photo.is_archived } });
  } catch (e) {
    next(e);
  }
};

// Unarchive a gallery photo
exports.unarchiveGalleryPhoto = async (req, res, next) => {
  try {
    const photo = await CafePhoto.findByPk(req.params.photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const cafe = await Cafe.findByPk(photo.cafe_id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    photo.is_archived = false;
    await photo.save();

    res.json({ message: "Photo restored", photo: { id: photo.id, is_archived: photo.is_archived } });
  } catch (e) {
    next(e);
  }
};

// Get all photos including archived for a cafe
exports.getAllGalleryPhotos = async (req, res, next) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (req.user.role !== "admin" && cafe.owner_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const photos = await CafePhoto.findAll({
      where: { cafe_id: req.params.id },
      order: [["id", "DESC"]],
    });

    const publicPhotos = photos.map(p => ({
      id: p.id,
      url: toPublicUrl(req, p.url),
      is_archived: p.is_archived,
      caption: p.caption,
      created_at: p.created_at,
    }));

    res.json({
      data: publicPhotos,
      active_count: photos.filter(p => !p.is_archived).length,
      archived_count: photos.filter(p => p.is_archived).length,
    });
  } catch (e) {
    next(e);
  }
};

