/* jshint node: true */
"use strict";

const { MONGO_URL, DB_NAME } = require("./config.js");
let { MongoClient } = require("mongodb");
let db = null;

// Call to intilize the connection
module.exports.connect =  async () => {

  console.log(`Connecting to database '${DB_NAME}' at '${MONGO_URL}'`);
  let client = await MongoClient.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
  db = client.db(DB_NAME);
  console.log("Connection succesful");

  // check to make sure we have read access
  let collections = await db.listCollections().toArray();
  if (collections.length === 0) {
    throw new Error("Collections query returned empty list");
  }
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
