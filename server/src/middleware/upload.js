const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fail } = require('../utils');

const dir = path.join(__dirname, '../../uploads');
fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: dir,
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`),
});

const filter = (types) => (req, file, cb) =>
  types.includes(file.mimetype) ? cb(null, true) : cb(fail(400, 'Unsupported file type'));

const IMG = ['image/jpeg', 'image/png', 'image/webp'];
const limits = { fileSize: 5 * 1024 * 1024 };

exports.documentUpload = multer({ storage, limits, fileFilter: filter([...IMG, 'application/pdf']) });
exports.photoUpload = multer({ storage, limits, fileFilter: filter(IMG) });
