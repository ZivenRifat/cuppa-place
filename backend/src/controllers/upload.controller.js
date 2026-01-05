// backend/src/controllers/upload.controller.js
const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

exports.ensureUploadRoot = (rootAbs) => {
  ensureDir(rootAbs);
  ensureDir(path.join(rootAbs, "logos"));
  ensureDir(path.join(rootAbs, "covers"));
  ensureDir(path.join(rootAbs, "gallery"));
  ensureDir(path.join(rootAbs, "tmp"));
};

function toPublicPath(filePath) {
  // filePath bisa: "uploads/logos/abc.png" atau absolute
  // kita normalisasi jadi "/uploads/...."
  const norm = String(filePath).replace(/\\/g, "/");

  // cari posisi "/uploads/" atau "uploads/"
  const idx = norm.lastIndexOf("/uploads/");
  if (idx >= 0) return norm.slice(idx); // sudah ada leading "/"

  const idx2 = norm.lastIndexOf("uploads/");
  if (idx2 >= 0) return "/" + norm.slice(idx2);

  // fallback (paling aman jangan expose absolute path)
  return null;
}

function getBaseUrl(req) {
  // supaya https kebaca benar di balik Cloudflare / reverse proxy
  const proto =
    (req.headers["x-forwarded-proto"] || req.protocol || "http")
      .toString()
      .split(",")[0]
      .trim();

  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}`;
}

exports.afterSingle = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const publicPath = toPublicPath(req.file.path);
  if (!publicPath) {
    return res.status(500).json({ message: "Cannot build public path" });
  }

  const base = getBaseUrl(req);

  return res.status(201).json({
    url: `${base}${publicPath}`, // ✅ https://cuppaplace.web.id/uploads/logos/xxx.png
    path: publicPath,           // ✅ /uploads/logos/xxx.png
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
};

exports.afterMultiple = async (req, res) => {
  const files = req.files || [];
  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const base = getBaseUrl(req);

  const items = files
    .map((f) => {
      const publicPath = toPublicPath(f.path);
      if (!publicPath) return null;
      return {
        url: `${base}${publicPath}`,
        path: publicPath,
        filename: f.filename,
        mimetype: f.mimetype,
        size: f.size,
      };
    })
    .filter(Boolean);

  return res.status(201).json({ files: items });
};
