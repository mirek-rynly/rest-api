/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");

let utils = require("../utils.js");

exports.QUOTE_REQUEST_VALIDATOR = [
  ev.query("is-expedited").exists().withMessage("required param missing").bail()
    .isBoolean().withMessage("must be one of [true,false]"),
  ev.query("size").exists().withMessage("required param missing").bail()
    .isIn(utils.PACKAGE_SIZES).withMessage(`must be one of [${utils.PACKAGE_SIZES}]`)
];

exports.getQuote = (req, res, next) => {
  let isExpedited = req.query["is-expedited"];
  let size = req.query.size;
  let price = getPackagePrice(size, isExpedited);
  res.json({quote: price, currency: "USD"});
};

let getPackagePrice = (size, isExpedited) => {
  let basePrice;
  switch (size) {
    case utils.ENVELOPE:
    case utils.SMALL:
    case utils.MEDIUM:
      basePrice = 5;
      break;
    case utils.LARGE:
      basePrice = 7;
      break;
    case utils.FULL:
      basePrice = 10;
      break;
    default:
      throw new Error(`Illegal box size '${size}'`);
  }
  return basePrice * ((isExpedited === "true") ? 2 : 1);
};
