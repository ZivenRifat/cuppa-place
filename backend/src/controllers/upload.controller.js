const path = require("path");
const fs = require("fs");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function baseUrl(req) {
  const envBase = (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (envBase) return envBase;
  // fallback kalau env belum di-set
  return `${req.protocol}://${req.get("host")}`;
}

function toUrl(req, relOrAbsPath) {
  if (!relOrAbsPath) return null;

  // kalau sudah absolute
  if (/^https?:\/\//i.test(relOrAbsPath)) return relOrAbsPath;

  // pastikan dia jadi "/uploads/...."
  const p = relOrAbsPath.startsWith("/") ? relOrAbsPath : `/${relOrAbsPath}`;
  return `${baseUrl(req)}${p}`;
}

exports.ensureUploadRoot = function (root) {
  ensureDir(root);
  ensureDir(path.join(root, "logos"));
  ensureDir(path.join(root, "covers"));
  ensureDir(path.join(root, "gallery"));
  ensureDir(path.join(root, "tmp"));
};

exports.afterSingle = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file" });

  // req.file.path contoh: "uploads/logos/abc.jpg"
  const rel = req.file.path.replace(/\\/g, "/");
  const urlPath = `/${rel}`; // "/uploads/logos/abc.jpg"
  const url = toUrl(req, urlPath); // absolute

  return res.status(201).json({
    url,      // absolute (disarankan)
    path: urlPath, // relative path (kalau butuh simpan ke DB)
  });
};

exports.afterMultiple = (req, res) => {
  if (!req.files || !req.files.length)
    return res.status(400).json({ message: "No files" });

  const urls = req.files.map((f) => {
    const rel = f.path.replace(/\\/g, "/");
    const urlPath = `/${rel}`;
    return toUrl(req, urlPath);
  });

  const paths = req.files.map((f) => `/${f.path.replace(/\\/g, "/")}`);

  return res.status(201).json({
    urls,  // absolute
    paths, // relative
  });
};
