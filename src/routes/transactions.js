const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactions');

router.post('/addTransactions', transactionController.addTransactions);

router.post('/removeTransactions', transactionController.removeTransactions);
router.post('/settleTransaction', transactionController.settleTransaction);

module.exports = router;
