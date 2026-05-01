const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.post('/predict', analyticsController.proxyPredict);
router.post('/fraud', analyticsController.proxyFraud);

module.exports = router;
