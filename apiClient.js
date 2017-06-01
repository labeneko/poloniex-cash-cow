import env from 'node-env-file';
import PoloniexApiClient from 'poloniex-api-node';
import BitFlyerApiClient from 'bitflyer-node';

export default class ApiClient {
  constructor() {
    if (process.env.API_KEY == null || process.env.API_SECRET == null) {
      env('./.env');
    }
    this.poloniexApiClient = new PoloniexApiClient(process.env.API_KEY, process.env.API_SECRET);
    this.bitflyerApiClient = new BitFlyerApiClient.REST();
  }

  getHoldingCurrencies() {
    return new Promise((resolve, reject) => {
      this.poloniexApiClient.returnCompleteBalances('all', function (err, currencies) {
        if (err) {
          reject(err);
        }
        const holdingCurrencies = Object.keys(currencies)
        .filter(key => currencies[key]['btcValue'] > 0)
        .reduce((prev, key) => {
          prev[key] = currencies[key];
          return prev;
        }, {});
        resolve(holdingCurrencies);
      });
    });
  }

  getAvailableCurrencies() {
    return new Promise((resolve, reject) => {
      this.poloniexApiClient.returnAvailableAccountBalances(null, function (err, currencies) {
        if (err) {
          reject(err);
        }
        resolve(currencies);
      });
    });
  }

  getBtcLendingOrders() {
    return new Promise((resolve, reject) => {
      this.poloniexApiClient.returnLoanOrders('BTC', null, function (err, orders) {
        if (err) {
          reject(err);
        }
        resolve(orders['offers']);
      });
    });
  }

  getBtcPrice() {
    return new Promise((resolve, reject) => {
      this.bitflyerApiClient.getTicker((err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result['best_bid']);
      });
    });
  }
}
