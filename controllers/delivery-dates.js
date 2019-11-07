/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let moment = require("moment-timezone");
let utils = require("../utils.js");

const DATETIME_DISPLAY_FORMAT = "YYYY-MM-DDTHH:MM:SS";

exports.GET_VALIDATOR = [
  ev.query("source-zip").exists().withMessage("required param missing"),
  ev.query("destination-zip").exists().withMessage("required param missing"),
  ev.query("is-expedited").exists().withMessage("required param missing").bail()
    .isBoolean().withMessage("must be one of [true,false]"),
  ev.query("order-creation-datetime").optional()
    .custom(dateStr => dateStr.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.]+$/))
      .withMessage("ISO8601 date must include time and may not include timezone (we assume pacific)").bail()
    .isISO8601().withMessage("illegal date value, must be ISO8601")
];

exports.getDeliveredByDate = (req, res, next) => {
  let sourceZip = req.query["source-zip"];
  let destinationZip = req.query["destination-zip"];
  let isExpeditedStr = req.query["is-expedited"];
  let creationDatetimeParam = req.query["order-creation-datetime"];

  let creationMoment;
  if (creationDatetimeParam) {
    creationMoment = moment(creationDatetimeParam).tz('America/Los_Angeles');;
  } else {
    creationMoment = moment().tz('America/Los_Angeles'); // "now" in Pacific
  }

  let isLocal = (isPortlandZip(sourceZip) === isPortlandZip(destinationZip));
  let isExpedited = (isExpeditedStr === "true");

  // e.g. "end of day due date for order placed at given time (2019-10-28T13:00:00 Pacific)"
  let whenPlaced = creationDatetimeParam ? "at given time" : "now";
  let creationMomentStr = creationMoment.format(DATETIME_DISPLAY_FORMAT);
  let msg = `end of day due date for order placed ${whenPlaced} (${creationMomentStr} Pacific)`;

  res.json({
    msg: msg,
    "due-date": getDueDate(isExpedited, isLocal, creationMoment)
  });
};

// HELPERS

let getDueDate = (isExpedited, isLocal, creationMoment) => {
  let creationDateStr = creationMoment.format("YYYY-MM-DD");

  // non-expedited always 3 days
  if (!isExpedited) {
    return addBusinessDays(creationDateStr, 3);
  }

  // local expedited before 11 is same day
  if (isLocal && creationMoment.hours() < 11) {
    return creationDateStr;
  }

  // all other expedited are next day
  return addBusinessDays(creationDateStr, 1);
};


// UTILS

// TODO: less hacky
let isPortlandZip = (zipStr) => {
  return zipStr.substring(0,2) === "97" || zipStr.substring(0,3) === "986";
};

// takes string in YYYY-MM-DD, returns string in YYYY-MM-DD
let addBusinessDays = (dateStr, daysToAdd) => {
  if (dateStr.match(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
    throw new Error("bad dateStr format: " + dateStr);
  }

  if (daysToAdd < 1) {
    throw new Error("daysToAdd can't be < 1");
  }

  let tomorrowStr = moment(dateStr).add(1, 'days').format("YYYY-MM-DD");

  // placing an order on friday or saturday is the same as placing it sunday
  if (isFridayOrSaturday(dateStr)) {
    return addBusinessDays(tomorrowStr, daysToAdd);
  }

  if (daysToAdd == 1) {
    return tomorrowStr;
  }

  return addBusinessDays(tomorrowStr, daysToAdd - 1);
};

let isFridayOrSaturday = (dateStr) => {
  return moment(dateStr).day() === 5 || moment(dateStr).day() === 6;
};
