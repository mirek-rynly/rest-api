/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let utils = require("../utils.js");

exports.GET_VALIDATOR = [
  ev.query("is_expedited").optional().isBoolean().withMessage("must be one of [true,false]"),
  ev.query("size").optional().isIn(utils.PACKAGE_SIZES).withMessage(`must be one of [${utils.PACKAGE_SIZES}]`)
];
exports.getPricing = (req, res, next) => {
  let isExpeditedFilter = req.query.is_expedited; // careful, this is a string, not a boolean
  let sizeFilter = req.query.size;

  let sizes = sizeFilter ? [sizeFilter] : utils.PACKAGE_SIZES;
  let isExpediatedStrings = isExpeditedFilter ? [stringToBoolean(isExpeditedFilter)] : [false, true]; // list cheaper price first

  let pricing = [];
  for (let isExpeditedStr of isExpediatedStrings) { // list all un-expediate items first
    for (let size of sizes) {
      pricing.push({
        size: size,
        "is_expedited": isExpeditedStr,
        price: getPackagePrice(size, isExpeditedStr),
        currency: "USD"
      });
    }
  }

  res.json({pricing: pricing});
};

let stringToBoolean = (inputStr) => {
  if (typeof inputStr !== "string") throw new Error("inputStr not a string");
  if (inputStr === "true") {
    return true;
  } else if (inputStr === "false") {
    return false;
  } else {
    throw new Error("inputStr must be one of 'true', 'false'");
  }
};

let getPackagePrice = (size, isExpeditedStr) => {
  if (typeof isExpeditedStr !== "boolean") throw new Error("isExpediated param must be boolean");
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
  return basePrice * (isExpeditedStr ? 2 : 1);
};
