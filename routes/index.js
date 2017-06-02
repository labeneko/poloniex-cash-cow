import express from 'express';
import ApiClient from '../apiClient.js';
import Decimal from 'decimal.js';
import LendingModel from '../lendingModel.js';

const router = express.Router();
const apiClient = new ApiClient();
const excludeLendingFeeRate = 0.85;

/* GET index page. */
router.get('/', (req, res, next) => {
  Promise.all([
    apiClient.getHoldingCurrencies(),
    apiClient.getBtcPrice(),
    apiClient.getBtcLendingOrders(),
    apiClient.getMyBtcActiveLendings()
  ])
  .then(([
    holdingCurrencies,
    btcPrice,
    btcLendingOrders,
    btcActiveLendings
  ]) => {
    const totalCurrenciesBtcValue = Object.keys(holdingCurrencies)
    .reduce((prev, key) => new Decimal(prev).plus(holdingCurrencies[key]['btcValue']).toNumber(), 0);
    const valuation = parseInt(new Decimal(totalCurrenciesBtcValue).times(btcPrice).toNumber(), 10);
    const btcLendingPercent = new Decimal(LendingModel.getLendingRate(btcLendingOrders)).times(100).toNumber();
    const totalBtcValue = holdingCurrencies['BTC']['btcValue'];
    console.log(LendingModel.getBtcDailyInterestRate(totalBtcValue, btcActiveLendings));
    const btcDailyInterestPercent = new Decimal(LendingModel.getBtcDailyInterestRate(totalBtcValue, btcActiveLendings)).times(excludeLendingFeeRate).times(100).toFixed(5);
    const btcYearlyInterestPercent = new Decimal(btcDailyInterestPercent).times(365).toFixed(5);
    const myBtcActiveLendings = Object.keys(btcActiveLendings)
    .reduce((prev, key) => {
      prev[key] = btcActiveLendings[key];
      prev[key]['percent'] = new Decimal(btcActiveLendings[key]['rate']).times(100);
      const utcDate = new Date(btcActiveLendings[key]['date']);
      utcDate.setHours(utcDate.getHours() + 9);
      prev[key]['date'] = utcDate.toLocaleString();
      return prev;
    }, {});
    const btcLendingValue = LendingModel.getBtcLendingValue(btcActiveLendings);
    const myBtcLendingPercent = new Decimal(btcLendingValue).div(totalBtcValue).times(100);
    res.render('index', {
      holdingCurrencies,
      totalCurrenciesBtcValue,
      btcPrice: btcPrice.toLocaleString(),
      valuation: valuation.toLocaleString(),
      btcLendingPercent,
      btcDailyInterestPercent,
      btcYearlyInterestPercent,
      myBtcActiveLendings,
      totalBtcValue,
      btcLendingValue,
      myBtcLendingPercent
    });
  });
});

export default router;
