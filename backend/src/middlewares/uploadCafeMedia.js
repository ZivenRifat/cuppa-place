// backend/src/middlewares/uploadCafeMedia.js
const path = require("path");
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

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === "cover" ? "covers" : "logos";
    cb(null, path.join(UPLOAD_ROOT, dir));
  },
  filename,
});

const uploadCafeMedia = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = { uploadCafeMedia, UPLOAD_ROOT };
