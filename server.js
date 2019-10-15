/* jshint node: true */
"use strict";

require('log-timestamp');
let express = require("express");
let bodyParser = require("body-parser");
let { query, exists, check, validationResult } = require("express-validator");
let database = require("./database.js");

const EXPRESS_PORT = 8081;

// setup server
let app = express();

// global middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} ${getIP(req)}`);
  next();
});

// define routes

// GET service_availability
const AVAILABILITY_VALIDATION = [query("source").exists(), query("destination").exists()];
app.get("/api/v1/service-availability", AVAILABILITY_VALIDATION, (req, res, next) => {
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
  if (validationErrors(req, res)) return;

  let trackingNumber = req.query["tracking-number"];
  let db = database.get();

  db.collection("Packages").find({"TrackingNumber": trackingNumber}, {
    projection: {
      "TrackingNumber": 1,
      "Status": 1,
      "Changes": 1
    }
  }).toArray((err, packages) => {
    if (err) {
      next(err);
      return;
    }
    console.log(`Package query result: '${JSON.stringify(packages, null, 2)}'`);
    if (packages.length === 0) {
      let err = new Error(`No package found for '${trackingNumber}'`);
        err.statusCode = 404; // not found
        next(err);
        return;
      }

      if (packages.length !== 1) {
        let err = new Error(`Multiple packages (${packages.legth}) found for '${trackingNumber}'`);
        err.statusCode = 500; // internal server error
        next(err);
        return;
      }

      let packageResult = packages[0]; // 'package' is a reserved word

      // STATUSES:
      // 0: Package Created
      // 1: Package Picked By Driver
      // 2: Package Checked In
      // 3: Package In Transit
      // 4: ?
      // 5: Package Delivered
      res.json({
        "tracking-number": packageResult.TrackingNumber,
        "current-status": packageResult.Status,
        "status-changes": packageResult.Changes
      });
    });
});


// default error catching middleware (validation handles its own error reporting)
app.use((err, req, res, next) => {
  console.error(err.message);
  console.error(err.stack);
  if (!err.statusCode) err.statusCode = 500;
  // make sure error format is consistent with parameter validation errors
  res.status(err.statusCode).send(
    {"errors": [{msg: err.message}]}
  );
});


// connect to mongo and start server
database.connect()
  .then(() => {
    app.listen(EXPRESS_PORT, () => {
      console.log(`Express server started on port ${EXPRESS_PORT}`);
    });
  })
  .catch((err) => {
    console.error("Couldn't connect to mongo: ", err);
    process.exit(1); // Fail hard if we can't connect to the DB
  });


// HELPERS

let checkServiceAvailability = (sourceZip, destinationZip, res, next) => {
  let db = database.get();
  let sourceZipQuery = {"ZipZones.ZipCode": sourceZip, "ZipZones": {$exists: true, $ne: null}};
  db.collection("Hubs").countDocuments(sourceZipQuery, (err, sourceCount) => {
    if (err) {
      next(err);
      return;
    }
    console.log(`Zip entry count for source '${sourceZip}': ${sourceCount}`);

    if (sourceCount < 1) {
      res.json({ service_availability: false });
      return;
    }

    let destZipQuery = {"ZipZones.ZipCode": destinationZip, "ZipZones": {$exists: true, $ne: null}};
    db.collection("Hubs").countDocuments(destZipQuery, (err, destCount) => {
      if (err) {
        next(err);
        return;
      }
      console.log(`Zip entry count for destination '${destinationZip}': ${destCount}`);

      if (destCount < 1) {
        res.json({ service_availability: false });
        return;
      }

      res.json({ service_availability: true });
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

let getIP = (req) => {
  // Careful: req.ip doesn't work if we're behind an nginx proxy!
  // https://stackoverflow.com/questions/8107856/how-to-determine-a-users-ip-address-in-node
  let raw_ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
  return raw_ip.split(",")[0].trim();
};
