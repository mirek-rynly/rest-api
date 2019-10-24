/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let utils = require("../utils.js");

const EVENT_TYPES = ["package.update"];


// Initialize WebHooks module.
let WebHooks = require('node-webhooks');

// Initialize webhooks module from on-disk database
let webHooks = new WebHooks({
    db: './webHooksDB.json', // json file that store webhook URLs
    httpSuccessCodes: [200, 201, 202, 203, 204], //optional success http status codes
});

exports.GET_ALL_VALIDATOR = [];

exports.POST_VALIDATOR = [
  ev.query("url").exists().withMessage("required param missing").bail()
    .isURL()//.withMessage("must be a url")
];

