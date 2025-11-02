const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { authRequired, roleRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/upload.controller');

const UP_ROOT = path.resolve('uploads');
ctrl.ensureUploadRoot(UP_ROOT);

function subdir(dir) {
  return (req, file, cb) => {
    cb(null, path.join('uploads', dir));
  };
}
function fileFilter(req, file, cb) {
  const ok = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(file.mimetype);
  if (!ok) return cb(new Error('Only image files allowed'));
  cb(null, true);
}
function filename(req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const name = crypto.randomBytes(16).toString('hex');
  cb(null, `${name}${ext}`);
}
function createMulter(dir) {
  return multer({
    storage: multer.diskStorage({
      destination: subdir(dir),
      filename,
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
  });
}

const upLogo = createMulter('logos');
const upGallery = createMulter('gallery');

router.post('/logo', authRequired, roleRequired('mitra','admin'), upLogo.single('file'), ctrl.afterSingle);
router.post('/gallery', authRequired, roleRequired('mitra','admin'), upGallery.array('files', 10), ctrl.afterMultiple);

module.exports = router;