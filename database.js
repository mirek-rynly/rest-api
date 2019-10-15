/* jshint node: true */
"use strict";

let { MongoClient } = require("mongodb");

const MONGO_URL = "mongodb://localhost:27017";
const MONGO_PARAMS = {useNewUrlParser: true, useUnifiedTopology: true};
const DB_NAME = "rynly";

let db = null;

// Call to intilize the connection
module.exports.connect = () => new Promise((resolve, reject) => {
  MongoClient.connect(MONGO_URL, MONGO_PARAMS, function(err, client) {
    if (err) {
      reject(err);
    } else {
      db = client.db(DB_NAME);
      console.log(`Connection to database ${DB_NAME} at ${MONGO_URL} successful`);
      resolve(db);
    }
  });
});

// From there on our, reuse the existing connection
module.exports.get = () => {
  if (!db) {
    throw new Error("Haven't initialized mongo connection yet");
  }
  return db;
};
