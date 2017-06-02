import Decimal from 'decimal.js';

const minLendingRate = 0.0006;
const wallAmount = 10;

export default class LendingModel {
  static getLendingRate(orders) {
    if (!orders) {
      return null;
    }
    for ( var key in orders ) {
      const order = orders[key];
      if (order['amount'] > wallAmount) {
        return order['rate'] > minLendingRate ? new Decimal(order['rate']).minus(0.00000001).toNumber() : null;
      }
    }
    return null;
  }

  static getBtcDailyInterestRate(totalBtcValue, btcLendings) {
    if (!totalBtcValue || !btcLendings) {
      return 0;
    }
    const dailyInterestRate = Object.keys(btcLendings)
    .reduce((prev, key) => {
      const lendingInterestRate = new Decimal(btcLendings[key]['amount']).div(totalBtcValue).times(btcLendings[key]['rate']).toNumber();
      return new Decimal(prev).plus(lendingInterestRate).toNumber()
    }, 0);
    return dailyInterestRate;
  }

  static getBtcLendingValue(btcLendings) {
    if (!btcLendings) {
      return 0;
    }
    const btcLendingValue = Object.keys(btcLendings)
    .reduce((prev, key) => new Decimal(prev).plus(btcLendings[key]['amount']).toNumber(), 0);
    return btcLendingValue;
  }
}
