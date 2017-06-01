import env from 'node-env-file';
import express from 'express';
import ApiClient from 'poloniex-api-node';

env('./.env');

const apiClient = new ApiClient(process.env.API_KEY, process.env.API_SECRET);
const router = express.Router();

/* GET index page. */
router.get('/', (req, res, next) => {
  apiClient.returnCompleteBalances('all', function (err, balances) {
    console.log(balances);
    const filteredBalances = Object.keys(balances)
    .filter(key => balances[key]['btcValue'] > 0)
    .reduce((prev, key) => {
      prev[key] = balances[key];
      return prev;
    }, {});
    const totalBtcValue = Object.keys(filteredBalances)
    .reduce((prev, key) => prev + parseFloat(balances[key]['btcValue']), 0)
    res.render('index', {
      balances: filteredBalances,
      totalBtcValue
    });
  });
});

export default router;
