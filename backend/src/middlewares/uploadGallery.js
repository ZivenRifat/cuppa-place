// Middleware untuk upload gallery foto cafe
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder uploads ada
const uploadDir = path.resolve(__dirname, "..", "..", "uploads");
const galleryDir = path.join(uploadDir, "gallery");

// Create directory if it doesn't exist
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

// Konfigurasi storage untuk gallery
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, galleryDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "gallery-" + uniqueSuffix + path.extname(file.originalname));
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

// Create multer instance
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    fileFilter,
});

// Export sebagai middleware dengan method .fields() yang kompatibel
const uploadGallery = {
    fields: function (fields) {
        return (req, res, next) => {
            // Tangani multiple photos
            const multiUpload = upload.array("photos", 8);
            multiUpload(req, res, (err) => {
                if (err) return next(err);
                next();
            });
        };
    },
};

module.exports = uploadGallery;

