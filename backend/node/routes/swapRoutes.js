const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');

router.post('/match', swapController.matchSwaps);
router.post('/commit', swapController.commitSwap);
router.get('/user/:userId', swapController.getUserSwaps);
router.get('/transaction/:id', swapController.getTransactionDetails);

module.exports = router;
