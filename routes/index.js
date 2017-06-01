import express from 'express';
import ApiClient from '../apiClient.js';
import LendingModel from '../lendingModel.js';

const router = express.Router();
const apiClient = new ApiClient();

/* GET index page. */
router.get('/', (req, res, next) => {
  Promise.all([apiClient.getHoldingCurrencies(), apiClient.getBtcPrice(), apiClient.getBtcLendingOrders()])
  .then(([holdingCurrencies, btcPrice, btcLendingOrders]) => {
    const totalBtcValue = Object.keys(holdingCurrencies)
    .reduce((prev, key) => prev + parseFloat(holdingCurrencies[key]['btcValue']), 0);
    const valuation = parseInt(totalBtcValue * btcPrice, 10);
    const btcLendingPercent = parseFloat(LendingModel.getLendingRate(btcLendingOrders)) * 100;
    res.render('index', {
      holdingCurrencies,
      totalBtcValue: totalBtcValue.toFixed(5),
      btcPrice: btcPrice.toLocaleString(),
      valuation: valuation.toLocaleString(),
      btcLendingPercent
    });
  });
});

export default router;
