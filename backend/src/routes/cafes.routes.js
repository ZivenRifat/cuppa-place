// backend/src/routes/cafes.routes.js
const router = require("express").Router();

const { authRequired, roleRequired } = require("../middlewares/auth");
const uploadCafeMedia = require("../middlewares/uploadCafeMedia");
const uploadGallery = require("../middlewares/uploadGallery");

const ctrl = require("../controllers/cafes.controller");
const reviewCtrl = require("../controllers/reviews.controller");

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
  uploadCafeMedia.fields([
    { name: "cover", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  ctrl.updateMedia
);

// Gallery routes
router.post(
  "/:id/gallery",
  authRequired,
  roleRequired("mitra", "admin"),
  uploadGallery.fields([{ name: "photos", maxCount: 8 }]),
  ctrl.uploadGallery
);

router.delete(
  "/:id/gallery/:photoId",
  authRequired,
  roleRequired("mitra", "admin"),
  ctrl.deleteGalleryPhoto
);

// Archive/Unarchive routes
router.post(
  "/:id/gallery/:photoId/archive",
  authRequired,
  roleRequired("mitra", "admin"),
  ctrl.archiveGalleryPhoto
);

router.post(
  "/:id/gallery/:photoId/unarchive",
  authRequired,
  roleRequired("mitra", "admin"),
  ctrl.unarchiveGalleryPhoto
);

// Get all photos including archived
router.get(
  "/:id/gallery/all",
  authRequired,
  roleRequired("mitra", "admin"),
  ctrl.getAllGalleryPhotos
);

module.exports = router;
