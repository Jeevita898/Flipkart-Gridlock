const express = require('express');
const router = express.Router();
const { reviewViolation, getReviewQueue } = require('../controllers/review.controller');

router.get('/queue', getReviewQueue);
router.post('/review', reviewViolation);

module.exports = router;
