// Middleware untuk upload logo dan cover cafe
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder uploads ada
const uploadDir = path.resolve(__dirname, "..", "..", "uploads");
const logosDir = path.join(uploadDir, "logos");
const coversDir = path.join(uploadDir, "covers");

// Create directories if they don't exist
[uploadDir, logosDir, coversDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Konfigurasi storage untuk logo
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "logo-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Konfigurasi storage untuk cover
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, coversDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "cover-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter untuk hanya menerima gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Hanya gambar (jpeg, jpg, png, gif, webp) yang diizinkan!"));
};

// Create multer instances
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Export sebagai middleware dengan method .fields()
const uploadCafeMedia = {
  fields: function (fields) {
    return (req, res, next) => {
      // Tangani logo
      const logoUpload = uploadLogo.single("logo");
      logoUpload(req, res, (logoErr) => {
        if (logoErr) return next(logoErr);

        // Tangani cover
        const coverUpload = uploadCover.single("cover");
        coverUpload(req, res, (coverErr) => {
          if (coverErr) return next(coverErr);
          next();
        });
      });
    };
  },
};

module.exports = uploadCafeMedia;

