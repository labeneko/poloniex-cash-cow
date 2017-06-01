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
        return order['rate'] > minLendingRate ? order['rate'] - 0.00000001 : minLendingRate;
      }
    }
    return null;
  }
}
