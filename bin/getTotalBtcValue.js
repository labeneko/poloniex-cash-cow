#!/usr/bin/env node

// enables ES6 ('import'.. etc) in Node
require('babel-core/register');
require('babel-polyfill');

const ApiClient = require('../apiClient.js').default;
const LendingModel = require('../lendingModel.js').default;
const apiClient = new ApiClient();
const Decimal = require('decimal.js');
const Datastore = require('nedb');
const db = new Datastore({ filename: 'nedb.db', autoload: true });

Promise.all([apiClient.getHoldingCurrencies(), apiClient.getBtcPrice()])
.then(function([holdingCurrencies, btcPrice]) {
  const totalBtcValue = Object.keys(holdingCurrencies)
  .reduce((prev, key) => new Decimal(prev).plus(holdingCurrencies[key]['btcValue']).toNumber(), 0);
  db.insert([
    { totalBtcValue: totalBtcValue , btcValue: btcPrice, currentTime: new Date().getTime() }
  ], function (err, newDocs) {
    if (err) {
      console.log(err);
    } else {
      console.log(newDocs);
    }
    process.exit(0);
  });
})
.catch(function(err){
  console.log(err);
  process.exit(0);
});
