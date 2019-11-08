/* jshint node: true */
"use strict";

let { MongoClient } = require("mongodb");

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.MONGO_URL;

let db = null;

// Call to intilize the connection
module.exports.connect =  async () => {

  console.log(`Connecting to database '${DB_NAME}' at '${MONGO_URL}'`);
  let client = await MongoClient.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
  db = client.db(DB_NAME);
  console.log("Connection succesful");

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
