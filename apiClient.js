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

  getLendableBtcValues() {
    return new Promise((resolve, reject) => {
      this.poloniexApiClient.returnAvailableAccountBalances(null, function (err, currencies) {
        if (err) {
          reject(err);
        }

        if (!currencies['lending']) {
          resolve(0);
        } else {
          resolve(currencies['lending']['BTC']);
        }
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

  getMyBtcLendingOrders() {
    return new Promise((resolve, reject) => {
      this.poloniexApiClient.returnOpenLoanOffers(function (err, orders) {
        if (err) {
          reject(err);
        }
        resolve(orders['BTC']);
      });
    });
  }

  cancelLendingOrder(orderNumber) {
    return new Promise((resolve, reject) => {
      this.poloniexApiClient.cancelLoanOffer(orderNumber, function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  createBtcLendingOrder(amount, lendingRate) {
    return new Promise((resolve, reject) => {
      this.poloniexApiClient.createLoanOffer('BTC', amount, 2, 0, lendingRate, function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
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
