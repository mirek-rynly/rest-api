/* jshint node: true */
"use strict";

require('dotenv').config();

module.exports = {
  MONGO_URL: process.env.MONGO_URL, // e.g. mongodb://localhost:27017
  DB_NAME: process.env.DB_NAME, // e.g. rynly
  RYNLY_SERVER_URL: process.env.RYNLY_SERVER_URL // e.g. https://uatuser.rynly.com or http://localhost:8082
};
