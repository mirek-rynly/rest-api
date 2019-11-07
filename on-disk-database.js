/* jshint node: true */
"use strict";

let storage = require("node-persist");

const LOCAL_STORAGE_FOLDER = "/tmp/on-disk-db";

let initialized = false;

// Call to intilize the connection
module.exports.connect = async () => {
  console.log(`initializing on-disk db, using folder ${LOCAL_STORAGE_FOLDER}`);
  await storage.init({dir: LOCAL_STORAGE_FOLDER});
  initialized = true;
};

// From there on our, reuse the existing connection
module.exports.get = () => {
  if (!initialized) {
    throw new Error("Haven't initialized on-disk databse yet");
  }
  return storage;
};
