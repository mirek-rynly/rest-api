/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let moment = require("moment");
let utils = require("../utils.js");


exports.GET_VALIDATOR = [
  ev.query("source-zip").exists().withMessage("required param missing"),
  ev.query("destination-zip").exists().withMessage("required param missing"),
  ev.query("is-expedited").optional().isBoolean().withMessage("must be one of [true,false]"),
  ev.query("order-creation-date").optional()
    // .custom(dateStr => dateStr.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/))
      // .withMessage("date must be formatted as YYYY-MM-DD").bail()
    .isISO8601().withMessage("illegal date value")
];

exports.getDeliveredByDate = (req, res, next) => {
  let sourceZip = req.query["source-zip"];
  let destinationZip = req.query["destination-zip"];
  let isExpeditedStr = req.query["is-expedited"];
  let creationDateParam = req.query["order-creation-date"];

  let creationDateStr;
  if (!creationDateParam) {
    creationDateStr = moment().format("YYYY-MM-DD");
  } else {
    creationDateStr = creationDateParam;
  }

  let isLocal = (isPortlandZip(sourceZip) === isPortlandZip(destinationZip));
  let isExpedited = (isExpeditedStr === "true");

  let expeditedType = (isExpedited ? "expedited " : "non-expedited");
  let distanceType = (isLocal ? "local" : "long-distance");
  let orderCreationMsg = (creationDateParam ? creationDateStr : "now (" + creationDateStr + ")");
  let msg = `${expeditedType} ${distanceType} delivery for order placed ${creationDateStr} Pacific`;

  // "end of day due date for order placed XYZ"

  res.json({
    msg: msg,
    "due-date": getDueDate(isExpedited, isLocal, creationDateStr)
  });
};


// HELPERS

let getDueDate = (isExpedited, isLocal, creationDateStr) => {
  if (!isExpedited) { // non-expedited always 3 days
    return addBusinessDays(creationDateStr, 3);
  }

  if (!isLocal) { // long distance expedited is always next day
    return addBusinessDays(creationDateStr, 1);
  }

  // local expedited depends on time of day order is placed here
  // TODO: take into account time of day
  return addBusinessDays(creationDateStr, 1);
};


// UTILS

// TODO: less hacky
let isPortlandZip = (zipStr) => {
  return zipStr.substring(0,2) === "97" || zipStr.substring(0,3) === "986";
};

// takes string in YYYY-MM-DD, returns string in YYYY-MM-DD
let addBusinessDays = (dateStr, daysToAdd) => {
  if (daysToAdd < 1) {
    throw new Error("daysToAdd can't be < 1");
  }
  let tomorrowStr = moment(dateStr).add('days', 1).format("YYYY-MM-DD");

  // placing an order on friday is the same as placing it on saturday or sunday
  if (isFriday(dateStr) || isSaturday(dateStr)) {
    return addBusinessDays(tomorrowStr, daysToAdd);
  }

  if (daysToAdd == 1) {
    return tomorrowStr;
  }

  return addBusinessDays(tomorrowStr, daysToAdd - 1);
};

let isFriday = (dateStr) => {
  return moment(dateStr).day() === 5;
};

let isSaturday = (dateStr) => {
  return moment(dateStr).day() === 6;
};
