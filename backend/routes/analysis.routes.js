const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { analyzeImage } = require('../controllers/analysis.controller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/analyze', upload.single('image'), analyzeImage);

module.exports = router;
