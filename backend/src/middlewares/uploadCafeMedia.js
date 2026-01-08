// backend/src/middlewares/uploadCafeMedia.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");

// ---------- multer khusus media cafe ----------
function fileFilter(req, file, cb) {
  const ok = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(file.mimetype);
  if (!ok) return cb(new Error("Only image files allowed"));
  cb(null, true);
}

function filename(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const name = crypto.randomBytes(16).toString("hex");
  cb(null, `${name}${ext}`);
}

// folder root uploads (di project root)
const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

// pastikan folder ada
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dirName = "logos";
    if (file.fieldname === "cover") dirName = "covers";
    if (file.fieldname === "gallery") dirName = "galleries";

    const dir = path.join(UPLOAD_ROOT, dirName);
    ensureDir(dir);
    cb(null, dir);
  },
  filename,
});

const uploadCafeMedia = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = { uploadCafeMedia, UPLOAD_ROOT };
