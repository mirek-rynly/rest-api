/* jshint node: true */
"use strict";

let { MongoClient } = require("mongodb");

const MONGO_URL = "mongodb://localhost:27017";
const MONGO_PARAMS = {useNewUrlParser: true, useUnifiedTopology: true};
const DB_NAME = "rynly";

let db = null;

// Call to intilize the connection
module.exports.connect =  async () => {
  let client = await MongoClient.connect(MONGO_URL, MONGO_PARAMS);
  db = client.db(DB_NAME);
  console.log(`Connection to database ${DB_NAME} at ${MONGO_URL} successful`);

  // check to make sure we have read access
  let collections = await db.listCollections().toArray();
  console.log(`Collections: '${collections.map(c => c.name)}'`);
  return db;
};

// From there on our, re-use the existing connection
module.exports.get = () => {
  if (!db) {
    throw new Error("Haven't initialized mongo connection yet");
  }
  return db;
};
