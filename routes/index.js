import express from 'express';
import ApiClient from '../apiClient.js';

const router = express.Router();
const apiClient = new ApiClient();

/* GET index page. */
router.get('/', (req, res, next) => {
  Promise.all([apiClient.getHoldingCurrencies(), apiClient.getBtcPrice()])
  .then(([holdingCurrencies, btcPrice]) => {
    const totalBtcValue = Object.keys(holdingCurrencies)
    .reduce((prev, key) => prev + parseFloat(holdingCurrencies[key]['btcValue']), 0);
    const valuation = parseInt(totalBtcValue * btcPrice, 10);
    res.render('index', {
      holdingCurrencies,
      totalBtcValue: totalBtcValue.toFixed(5),
      btcPrice: btcPrice.toLocaleString(),
      valuation: valuation.toLocaleString()
    });
  });
});

export default router;
