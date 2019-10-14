/* jshint node: true */
"use strict";

let express = require("express");
let bodyParser = require("body-parser");
let mongodb = require("mongodb");

const { query, exists, check, validationResult } = require("express-validator");

const MONGO_URL = "mongodb://localhost:27017";
const MONGO_PARAMS = {useNewUrlParser: true, useUnifiedTopology: true};
const DB_NAME = "rynly";
const EXPRESS_PORT = 8081;

let MongoClient = mongodb.MongoClient;

// test db connection
MongoClient.connect(MONGO_URL, MONGO_PARAMS, (err, client) => {
  if (err) throw err; // die if connection is bad on startup
  console.log(`DB_NAME connection to ${MONGO_URL} successful`);
});

// setup server
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// define routes

// GET service_availability
const AVAILABILITY_VALIDATION = [query("source").exists(), query("destination").exists()];
app.get("/api/v1/service-availability", AVAILABILITY_VALIDATION, (req, res, next) => {
  logRequest(req);
  if (validationErrors(req, res)) return;

  let sourceZip = req.query.source;
  let destinationZip = req.query.destination;

  checkServiceAvailability(sourceZip, destinationZip, res, next);
});

// GET quote
const BOX_SIZES = ["flat", "small", "medium", "large", "full"];
const QUOTE_VALIDATION = [
  query("is-expedited").exists().isBoolean().withMessage("must be one of [true,false]"),
  query("size").exists().isIn(BOX_SIZES).withMessage(`must be one of [${BOX_SIZES}]`)
];
app.get("/api/v1/quote", QUOTE_VALIDATION, (req, res, next) => {
  logRequest(req);
  if (validationErrors(req, res)) return;

  let isExpedited = req.query["is-expedited"];
  let size = req.query.size;

  let price = getPackagePrice(size, isExpedited);
  res.json({quote: price, currency: "USD"});
});

// GET package status
const PACKAGE_STATUS_VALIDATION = [
  query("tracking-number").exists()
  .isLength({min:14, max: 14}).withMessage("must be 14 character string")
  .isAlphanumeric().withMessage("must be alphanumeric string")
];
app.get("/api/v1/package-status", PACKAGE_STATUS_VALIDATION, (req, res, next) => {
  logRequest(req);
  if (validationErrors(req, res)) return;
  // TODO: do the above in middleware style

  let trackingNumber = req.query["tracking-number"];
  res.json({youGave: trackingNumber});
});



// error catching middleware
app.use(function(err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  // make sure format is consistent with parameter validation
  res.status(err.statusCode).send(
    {errors: [{msg: err.message}]}
  );
});

// start server
app.listen(EXPRESS_PORT, () => {
  console.log(`Express server started on port ${EXPRESS_PORT}`);
});


// HELPERS

let checkServiceAvailability = (sourceZip, destinationZip, res, next) => {

  MongoClient.connect(MONGO_URL, MONGO_PARAMS, (err, client) => {
    if (mongoConnectError(err, client, next)) return;

    let db = client.db(DB_NAME);
    let sourceZipQuery = {"ZipZones.ZipCode": sourceZip, "ZipZones": {$exists: true, $ne: null}};
    db.collection("Hubs").countDocuments(sourceZipQuery, (err, sourceCount) => {
      if (mongoConnectError(err, client, next)) return;

      console.log(`Zip entry count for '${sourceZip}': ${sourceCount}`);
      if (sourceCount < 1) {
        res.json({ service_availability: false });
        client.close();
        return;
      }

      let destZipQuery = {"ZipZones.ZipCode": destinationZip, "ZipZones": {$exists: true, $ne: null}};
      db.collection("Hubs").countDocuments(destZipQuery, (err, destCount) => {
        if (mongoConnectError(err, client, next)) return;

        console.log(`Zip entry count for '${destinationZip}': ${destCount}`);
        if (destCount < 1) {
          res.json({ service_availability: false });
          client.close();
          return;
        }

        res.json({ service_availability: true });
        client.close();
      });
    });
  });
};

let getPackagePrice = (size, isExpedited) => {
  let basePrice;
  switch (size) {
    case "flat":
    case "small":
    case "medium":
      basePrice = 5;
      break;
    case "large":
      basePrice = 7;
      break;
    case "full":
      basePrice = 10;
      break;
    default:
      throw new Error(`Illegal box size '${size}'`);
  }
  return basePrice * ((isExpedited === "true") ? 2 : 1);
};


// UTILS

let validationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

let mongoConnectError = (err, client, next) => {
  if (err) {
    next(err);
    if (client) client.close();
    return true;
  }
  return false;
};

function logRequest(req) {
  console.log(`${req.method} ${req.originalUrl} ${getIP(req)}`);
}

function getIP(req) {
  // Careful: req.ip doesn't work if we're behind an nginx proxy!
  // https://stackoverflow.com/questions/8107856/how-to-determine-a-users-ip-address-in-node
  let raw_ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
  return raw_ip.split(",")[0].trim();
}
