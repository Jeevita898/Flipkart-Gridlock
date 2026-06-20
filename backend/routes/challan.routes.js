const express = require('express');
const router = express.Router();
const {
  issueChallan,
  listChallans,
  downloadPDF,
  disputeChallan,
  getChallan,
} = require('../controllers/challan.controller');

router.post('/challan', issueChallan);
router.get('/challan', listChallans);
router.get('/challan/:id', getChallan);
router.get('/challan/:id/pdf', downloadPDF);
router.post('/challan/:id/dispute', disputeChallan);

module.exports = router;
