/* jshint node: true */
"use strict";

require("log-timestamp");
let express = require('express');

let utils = require("./utils.js");
let mongoDB = require("./database.js");
let onDiskDB = require("./on-disk-database");
let app = require("./app.js");

const { RYNLY_SERVER_URL } = require("./config.js");
const EXPRESS_PORT = 8081;

// connect to mongo and start server
let runServer = async () => {
  // TODO: test that we can connect to Rynly server
  console.log(`Configured to connect to Rynly server at ${RYNLY_SERVER_URL}`);

  try {
    await mongoDB.connect();
  } catch(err) {
    console.error("Couldn't connect to mongo: ", err);
    process.exit(1); // Fail hard if we can't connect to the DB
  }

  try {
    await onDiskDB.connect();
  } catch(err) {
    console.error("Couldn't connecto to on-disk JSON db: ", err);
    process.exit(1);
  }

  app.listen(EXPRESS_PORT, () => {
    console.log(`Express server started on port ${EXPRESS_PORT}`);
  });
};

runServer();
