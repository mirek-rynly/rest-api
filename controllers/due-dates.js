/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let utils = require("../utils.js");

exports.GET_VALIDATOR = [
  ev.query("order-creation-timestamp").optional().isISO8601()
    .withMessage("must be ISO8601 datetime, e.g. '2019-02-25T12:39:45Z'")
];
exports.getDeliveredByDate = (req, res, next) => {
  res.json({arg: req.query["order-creation-timestamp"]});
};

