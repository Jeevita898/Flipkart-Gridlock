const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecommendations } = require('../controllers/analytics.controller');

router.get('/analytics', getDashboardStats);
router.get('/analytics/recommendations', getRecommendations);

module.exports = router;
