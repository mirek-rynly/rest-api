/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let moment = require("moment-timezone");
let utils = require("../utils.js");

const DATETIME_DISPLAY_FORMAT = "YYYY-MM-DD HH:mm:ss";

exports.GET_VALIDATOR = [
  ev.query("from_zip").exists().withMessage("required param missing"),
  ev.query("to_zip").exists().withMessage("required param missing"),
  ev.query("is_expedited").exists().withMessage("required param missing").bail()
    .isBoolean().withMessage("must be one of [true,false]"),
  ev.query("order_creation_datetime").optional()
    .custom(dateStr => dateStr.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.]+Z$/))
      .withMessage("ISO8601 date must include time and be in UTC (e.g. 2019-10-28T06:00:00Z)").bail()
    .isISO8601().withMessage("illegal date value, must be ISO8601")
];

exports.getDeliveredByDate = (req, res, next) => {
  let fromZip = req.query.from_zip;
  let toZip = req.query.to_zip;
  let isExpeditedStr = req.query.is_expedited;
  let creationDatetimeParam = req.query.order_creation_datetime;

  let creationMomentPacific;
  if (creationDatetimeParam) {
    creationMomentPacific = moment(creationDatetimeParam).tz('America/Los_Angeles');
  } else {
    creationMomentPacific = moment().tz('America/Los_Angeles'); // "now" in Pacific
  }

  let isLocal = (isPortlandZip(fromZip) === isPortlandZip(toZip));
  let isExpedited = (isExpeditedStr === "true");

  // e.g. "end of day due date for order placed at given time (2019-10-28T06:00:00Z)"
  let whenPlaced = creationDatetimeParam ? "at given time" : "now";
  let prettyOrderTime = creationMomentPacific.format(DATETIME_DISPLAY_FORMAT);
  let msg = `end of day due date for order placed ${whenPlaced} (${prettyOrderTime} Pacific)`;

  res.json({
    "due_date": getDueDate(isExpedited, isLocal, creationMomentPacific),
    msg: msg
  });
};

// HELPERS

let getDueDate = (isExpedited, isLocal, creationMomentPacific) => {
  let creationDateStr = creationMomentPacific.format("YYYY-MM-DD");

  // non-expedited always 3 days
  if (!isExpedited) {
    return addBusinessDays(creationDateStr, 3);
  }

  // local expedited before 11 is same day
  if (isLocal && creationMomentPacific.hours() < 11) {
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
