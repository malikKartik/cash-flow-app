const express = require('express');
const router = express.Router();

const placeController = require('../controllers/place');

router.post('/getTransactions', placeController.getTransactions);
router.post('/settleAllTransactions', placeController.settleAllTransactions);
module.exports = router;
