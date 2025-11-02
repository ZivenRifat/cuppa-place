const path = require('path');
const fs = require('fs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

exports.ensureUploadRoot = function(root) {
  ensureDir(root);
  ensureDir(path.join(root, 'logos'));
  ensureDir(path.join(root, 'gallery'));
};

exports.afterSingle = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const rel = req.file.path.replace(/\\/g, '/');
  const url = `/${rel}`;
  return res.status(201).json({ url });
};

exports.afterMultiple = (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ message: 'No files' });
  const urls = req.files.map(f => `/${f.path.replace(/\\/g, '/')}`);
  return res.status(201).json({ urls });
};