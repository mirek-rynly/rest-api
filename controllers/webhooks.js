/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let axios = require("axios");

let onDiskDB = require("../on-disk-database.js");
let utils = require("../utils.js");

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
  db.forEach(datum => {
      allWebhooks.push({
        "tracking-number": datum.key,
        "subscription-url": datum.value
      });
    })
    .then(() => {
      console.log(`All webhooks: ${JSON.stringify(allWebhooks)}`);
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

  // TODO: indicate it already exists if you're updating and existing one
  let db = onDiskDB.get();
  db.setItem(trackingNumber, url)
    .then(saveResponse => {
      console.log(`Save item response: ${JSON.stringify(saveResponse)}`);
      let responseBody = {
        "msg": "succesfully added webhook",
        "tracking-number": saveResponse.content.key,
        "subscription-url": saveResponse.content.value,
      };
      res.status(201);
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
      console.log(`Delete result: ${JSON.stringify(deleteResult)}`);
      let responseBody = {
        "msg": "delete operation sucessful",
        "tracking-number": trackingNumber
      };
      res.json(responseBody);
    })
    .catch(err => next(err));
};

exports.TRIGGER_VALIDATOR = [
  TRACKING_NUM_IN_BODY_VALIDATION,
  ev.body("event-type").exists().withMessage("required param missing").bail()
    .isIn(Object.values(utils.PACKAGE_STATUS_MAP))
    .withMessage(`must be one of [${Object.values(utils.PACKAGE_STATUS_MAP)}]`)
];
exports.triggerWebhook = (req, res, next) => {
  let trackingNumber = req.body["tracking-number"];
  let eventType = req.body["event-type"];
  console.log(`Request to trigger webhook for '${trackingNumber}' with event '${eventType}'`);

  let db = onDiskDB.get();
  let subscriptionUrl = null; // TODO: instead of using promise side effects, switch to `await`
  db.getItem(trackingNumber)
    .then(_subscriptionUrl => {
      subscriptionUrl = _subscriptionUrl;
      console.log(`DB query result: ${subscriptionUrl}`);
      if (!subscriptionUrl) {
        let err = new Error(`No webhook entry found for '${trackingNumber}'`);
        err.statusCode = 404; // not found
        throw err;
      }
      let payload = getExampleChangeEvent(trackingNumber, eventType);
      console.log(`Posting to '${subscriptionUrl}' with payload '${JSON.stringify(payload)}`);
      return axios.post(subscriptionUrl, payload);
    })
    .then(innerPostResponse => {
      console.log(`Post response: ${JSON.stringify(innerPostResponse.data)}`);
      let responseBody = {
        "msg": "triggered event posted succesfully",
        "trigger-params": {
          "tracking-number": trackingNumber,
          "event-type": eventType,
          "subscription-url": subscriptionUrl,
        },
        "trigger-response": {
          "body": innerPostResponse.data,
          "status-code": innerPostResponse.status
        }
      };
      res.send(responseBody);
    })
    .catch(err => {
      let innerError = null;
      if (err.isAxiosError) {
        innerError = {
          "msg": `POST to subscription url failed with message '${err.message}'`,
          "status-code": err.response.status,
          "response": err.response.data
        };
      } else {
        innerError = {
          "msg": err.message,
          "staus-code": err.statusCode
        };
      }

      let statusCode = err.statusCode ? err.statusCode : err.status; // axious errors use ".status"
      let responseBody = {
        "msg": "triggering event failed",
        "trigger-params": {
          "tracking-number": trackingNumber,
          "event-type": eventType,
          "subscription-url": subscriptionUrl,
        },
        "inner-error": innerError
      };
      // ensure error format is consistent with parameter validation errors
      res.status(500).json({"errors": [responseBody]});
  });
};

// UTILS

// example Packages.Changes event from DB
// {
//   "Date" : ISODate("2019-05-10T11:07:31.136Z"),
//   "Text" : "Package Created",
//   "Status" : 0,
//   "HubId" : null,
//   "AdminChange" : false,
//   "ChangedBy" : "7065e111-d0d4-4c17-bf23-49e5f1addcb9"
// }
function getExampleChangeEvent(trackingNumber, packageStatus) {
  if (!Object.values(utils.PACKAGE_STATUS_MAP).includes(packageStatus)) {
    throw new Error(`Unrecognized package status '${packageStatus}'`);
  }
  return {
      "tracking-number": trackingNumber,
      "date": "2019-10-20T11:07:31.136Z",
      "msg": `package ${packageStatus}`
  };
}
