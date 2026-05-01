const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.post('/', propertyController.createProperty);
router.get('/user/:userId', propertyController.getUserProperties);
router.post('/desirability-score', propertyController.getDesirabilityScore);

module.exports = router;
