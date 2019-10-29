/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let onDiskDB = require("../on-disk-database.js");
let utils = require("../utils.js");

// const EVENT_TYPES = ["package.update"];

// shared validation

const TRACKING_NUM_IN_BODY_VALIDATION = // TODO: de-dupe with packages.js
  ev.body("tracking-number").exists().withMessage("required param missing").bail()
    .isLength({min:14, max: 14}).withMessage("must be 14 character string")
    .isAlphanumeric().withMessage("must be alphanumeric string");

const TRACKING_NUM_IN_URL_VALIDATION =
  ev.param("trackingNumber").exists().withMessage("required param missing").bail()
    .isLength({min:14, max: 14}).withMessage("must be 14 character string")
    .isAlphanumeric().withMessage("must be alphanumeric string");


// controllers

exports.GET_ALL_VALIDATOR = [];
exports.getAllWebhooks = (req, res, next) => {
  let db = onDiskDB.get();
  let allWebhooks = [];
  db.forEach((datum) => allWebhooks.push(datum))
    .then(() => {
      console.log(`All webhooks: ${allWebhooks}`);
      res.json(allWebhooks);
    })
    .catch(err => next(err));
};

exports.GET_VALIDATOR = [TRACKING_NUM_IN_URL_VALIDATION];
exports.getWebhook = (req, res, next) => {
  let trackingNumber = req.params.trackingNumber;
  console.log(`Fetching webhook record for '${trackingNumber}'`);

  let db = onDiskDB.get();
  db.getItem(trackingNumber)
    .then(dbRecord => {
      console.log(`DB query result: ${dbRecord}`);
      if (!dbRecord) {
        let err = new Error(`No webhook found for '${trackingNumber}'`);
        err.statusCode = 404; // not found
        next(err);
        return;
      }
      let responseBody = {
        "tracking-number": trackingNumber,
        "subscription-url": dbRecord
      };
      res.json(responseBody);
    })
    .catch(err => next(err));
};

exports.POST_VALIDATOR = [
  TRACKING_NUM_IN_BODY_VALIDATION,
  ev.body("subscription-url").exists().withMessage("required param missing").bail()
    .isURL().withMessage("not a valid url")
];
exports.postWebhook = (req, res, next) => {
  let trackingNumber = req.body["tracking-number"];
  let url = req.body["subscription-url"];
  console.log(`Saving webhook record '${trackingNumber} => ${url}'`);

  let db = onDiskDB.get();
  db.setItem(trackingNumber, url)
    .then(saveResponse => {
      console.log(`Save item response: ${saveResponse}`);
      let responseBody = {
        "msg": "succesfully added webhook",
        "tracking-number": saveResponse.content.key,
        "subscription-url": saveResponse.content.value,
      };
      res.json(responseBody);
    })
    .catch(err => next(err));
};

exports.DELETE_VALIDATOR = [TRACKING_NUM_IN_URL_VALIDATION];
exports.deleteWebhook = (req, res, next) => {
  let trackingNumber = req.params.trackingNumber;
  console.log(`Deleting webhook for '${trackingNumber}'`);

  let db = onDiskDB.get();
  db.removeItem(trackingNumber)
    .then(deleteResult => {
      console.log(`Delete result: ${deleteResult}`);
      let responseBody = {
        "msg": "delete operation sucessful",
        "tracking-number": trackingNumber,
        "existed": deleteResult.existed
      };
      res.json(responseBody);
    })
    .catch(err => next(err));
};

exports.TRIGGER_VALIDATOR = [
  TRACKING_NUM_IN_BODY_VALIDATION,
  ev.body("event-type").exists().withMessage("required param missing").bail()
    .isIn(Object.values(utils.PACKAGE_STATUS_MAP)).withMessage(`must be one of [${Object.values(utils.PACKAGE_STATUS_MAP)}]`)
];
exports.triggerWebhook = (req, res, next) => {
  let trackingNumber = req.body["tracking-number"];
  let eventType = req.body["event-type"];
  console.log(`Request to trigger webhook for '${trackingNumber}' for event '${eventType}'`);

  let db = onDiskDB.get();
  db.getItem(trackingNumber)
    .then(subscriptionUrl => {
      console.log(`DB query result: ${subscriptionUrl}`);
      if (!subscriptionUrl) {
        let err = new Error(`No webhook found for '${trackingNumber}'`);
        err.statusCode = 404; // not found
        next(err);
        return;
      }
      let responseBody = {
        "msg": `sucessfully triggered event`,
        "event-type": eventType,
        "tracking-number": trackingNumber,
        "subscription-url": subscriptionUrl
      };
      res.json(responseBody);
    })
    .catch(err => next(err));
};


// UTILS
