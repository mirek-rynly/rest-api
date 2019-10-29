/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let onDiskDB = require("../on-disk-database.js");

const EVENT_TYPES = ["package.update"];

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

exports.GET_VALIDATOR = [
  ev.param("trackingNumber").exists().withMessage("required param missing").bail() // TODO: de-dupe with packages.js
    .isLength({min:14, max: 14}).withMessage("must be 14 character string")
    .isAlphanumeric().withMessage("must be alphanumeric string")
];
exports.getWebhook = (req, res, next) => {
  let trackingNumber = req.params.trackingNumber;
  console.log(`Saving webhook record for '${trackingNumber}'`);
  let db = onDiskDB.get();
  db.getItem(trackingNumber)
    .then(dbRecord => {
      let responseBody = {
        "tracking-number": trackingNumber,
        "subscription-url": dbRecord
      };
      res.json(responseBody);
    })
    .catch(err => next(err));
};

exports.POST_VALIDATOR = [
  ev.body("tracking-number").exists().withMessage("required param missing").bail() // TODO: de-dupe with packages.js
    .isLength({min:14, max: 14}).withMessage("must be 14 character string")
    .isAlphanumeric().withMessage("must be alphanumeric string"),
  ev.body("subscription-url").exists().withMessage("required param missing").bail()
    .isURL().withMessage("not a valid url")
];
exports.postWebhook = (req, res, next) => {
  let trackingNumber = req.body["tracking-number"];
  let url = req.body["subscription-url"];
  console.log(`Saving webhook record '${trackingNumber} => ${url}'`);
  let db = onDiskDB.get();
  db.setItem(trackingNumber, url)
    .then(dbSetResponse => {
      let responseBody = {
        "msg": "succesfully added webhook",
        "tracking-number": dbSetResponse.content.key,
        "subscription-url": dbSetResponse.content.value,
      };
      res.json(responseBody);
    })
    .catch(err => next(err));
};


