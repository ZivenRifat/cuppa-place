const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const { authRequired, roleRequired } = require("../middlewares/auth");
const ctrl = require("../controllers/cafes.controller");
const reviewCtrl = require("../controllers/reviews.controller");

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

const uploadMedia = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// ---------- routes existing ----------
router.get("/", ctrl.list);
router.get("/:id", ctrl.detail);
router.get("/:id/menu", ctrl.menu);
router.get("/:id/reviews", reviewCtrl.listForCafe);
router.post("/:id/reviews", authRequired, reviewCtrl.create);
router.get("/:id/reports", authRequired, ctrl.reports);
router.put("/:id", authRequired, ctrl.update);
router.post(
  "/:id/media",
  authRequired,
  roleRequired("mitra", "admin"),
  uploadMedia.fields([
    { name: "cover", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  ctrl.updateMedia
);

module.exports = router;
