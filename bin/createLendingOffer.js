#!/usr/bin/env node

// enables ES6 ('import'.. etc) in Node
require('babel-core/register');
require('babel-polyfill');

const ApiClient = require('../apiClient.js').default;
const LendingModel = require('../lendingModel.js').default;
const apiClient = new ApiClient();

// 現在のオファーをキャンセルする
apiClient.getMyBtcLendingOrders()
.then(function(orders) {
  const promiseFunc = [];
  for (var key in orders) {
    promiseFunc.push(apiClient.cancelLendingOrder(orders[key]['id']))
  }
  return Promise.all(promiseFunc);
})
.then(function() {
  return Promise.all([apiClient.getLendableBtcValues(), apiClient.getBtcLendingOrders()]);
})
.then(function([lendableBtcValues, btcLendingOrders]) {
  // 貸出余力が0.01BTC以下なら終了
  if (lendableBtcValues < 0.01) {
    process.exit(0);
  }
  // 貸出金利を決める
  const lendingRate = parseFloat(LendingModel.getLendingRate(btcLendingOrders));
  // 最低金利を下回る場合は終了
  if (lendingRate === null) {
    process.exit(0);
  }
  console.log(lendingRate);
  return apiClient.createBtcLendingOrder(lendableBtcValues, lendingRate);
})
.then(function(result) {
  console.log(result);
  process.exit(0);
})
.catch(function(err){
  console.log(err);
  process.exit(0);
});
