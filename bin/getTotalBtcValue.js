#!/usr/bin/env node

// enables ES6 ('import'.. etc) in Node
require('babel-core/register');
require('babel-polyfill');

const ApiClient = require('../apiClient.js').default;
const LendingModel = require('../lendingModel.js').default;
const apiClient = new ApiClient();
const Decimal = require('decimal.js');
const MongoClient = require('mongodb').MongoClient;

if (process.env.MONGODB_URL == null) {
  env('./.env');
}

const mongoDbUrl = process.env.MONGODB_URL;

Promise.all([apiClient.getHoldingCurrencies(), apiClient.getBtcPrice()])
.then(function([holdingCurrencies, btcPrice]) {
  const totalBtcValue = Object.keys(holdingCurrencies)
  .reduce((prev, key) => new Decimal(prev).plus(holdingCurrencies[key]['btcValue']).toNumber(), 0);
  MongoClient.connect(mongoDbUrl, function(err, db) {
    if (err) {
      console.log(err);
    }
    const collection = db.collection('documents');
    collection.insert({ totalBtcValue: totalBtcValue , btcValue: btcPrice, currentTime: new Date().getTime() })
    .then(function(result) {
      console.log(result);
      process.exit(0);
    });
  });
})
.catch(function(err){
  console.log(err);
  process.exit(0);
});
