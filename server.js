/* jshint node: true */
"use strict";

require("log-timestamp");
let express = require('express');

let utils = require("./utils.js");
let database = require("./database.js");
let app = require("./app.js");

const EXPRESS_PORT = 8081;

// connect to mongo and start server
database.connect()
  .then(() => {
    app.listen(EXPRESS_PORT, () => {
      console.log(`Express server started on port ${EXPRESS_PORT}`);
      // TODO: test that we can connect to Rynly server
    });
  })
  .catch((err) => {
    console.error("Couldn't connect to mongo: ", err);
    process.exit(1); // Fail hard if we can't connect to the DB
  });
