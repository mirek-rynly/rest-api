/* jshint node: true */
"use strict";

require('log-timestamp');
let express = require("express");
let bodyParser = require("body-parser");
let ev = require("express-validator");
let database = require("./database.js");

const EXPRESS_PORT = 8081;
const BOX_SIZES = ["envelope", "small", "medium", "large", "full"];

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
const AVAILABILITY_VALIDATION = [
  ev.query("source").exists().withMessage("required param missing"),
  ev.query("destination").exists().withMessage("required param missing")
];
app.get("/api/v1/service-availability", AVAILABILITY_VALIDATION, (req, res, next) => {
  if (validationErrors(req, res)) return;
  let sourceZip = req.query.source;
  let destinationZip = req.query.destination;
  checkServiceAvailability(sourceZip, destinationZip, res, next);
});


// GET quote
const QUOTE_VALIDATION = [
  ev.query("is-expedited").exists().withMessage("required param missing").bail()
    .isBoolean().withMessage("must be one of [true,false]"),
  ev.query("size").exists().withMessage("required param missing").bail()
    .isIn(BOX_SIZES).withMessage(`must be one of [${BOX_SIZES}]`)
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
  ev.query("tracking-number").exists().withMessage("required param missing").bail()
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

// POST new package order

let addressValidation = (addressType) =>{
  let validator = [];
  let requiredFields = ["line-1", "city", "state", "zip", "contact-name", "phone"];
  requiredFields.push("location", "location.latitude", "location.longitude");
  for (let requiredField of requiredFields) {
    let fullName = `${addressType}.${requiredField}`;
    validator.push(ev.body(fullName).not().isEmpty().withMessage("required param missing or empty").bail());
  }

  // Our server requires valid US phone numbers, check here to fail fast
  // Examples that should pass both here and on the server include:
  // 971-222-9649, 9712229649, +1 971-222-9649, 19712229649
  //
  // However, our server allows extensions, whereas this validation logic does NOT
  // Examples that fail here and pass there:
  // 971-222-9649 ext. 8, 971-222-9649 ext.8, 971-222-9649 ext8, 971-222-9649 ex.8
  //
  // TODO: use our server route for validation
  validator.push(ev.body(`${addressType}.phone`).isMobilePhone("en-US").withMessage("not a valid phone number"));

  // Latitude / longitude validation
  validator.push(ev.body(`${addressType}.location.latitude`).isDecimal().withMessage("not a valid decimal"));
  validator.push(ev.body(`${addressType}.location.longitude`).isDecimal().withMessage("not a valid decimal"));

  return validator;
};

let newOrderValidation = () => {
  let validator = [
    ev.body("size").exists().withMessage("required param missing").bail()
      .isIn(BOX_SIZES).withMessage(`must be one of [${BOX_SIZES}]`),
    ev.body("pickup-note").if(ev.body("pickup-note").exists())
      .isLength({max: 90}).withMessage("max length is 90"),
    ev.body("delivery-note").if(ev.body("delivery-note").exists())
      .isLength({max: 90}).withMessage("max length is 90")
  ];
  validator.push(...addressValidation("from-address"));
  validator.push(...addressValidation("to-address"));
  return validator;
};

app.post("/api/v1/new-order", newOrderValidation(), (req, res, next) => {
  if (validationErrors(req, res)) return;

  let size = req.body.size;
  let pickupNote = req.body["pickup-note"] ? req.body["pickup-note"] : "";
  let deliveryNote = req.body["delivery-note"] ? req.body["delivery-note"] : "";
  let userID = "cdacc808-1efa-47e7-9a50-a78aa0801efb"; // TODO
  let dueDate = "2019-10-15T12:50:06.380Z"; // TODO

  // this is how we model box type at the API / DB layer (jikes)
  // envelope is type=0 and envelopeCount="1" with zero dimensions
  // everything else is type=1 and non-zero dimensions
  let itemObj = {type: 1, envelopeCount: 0, height: 0, width: 0, depth: 0};
  switch (size) {
    case "envelope":
      Object.assign(itemObj, {type: 0, envelopeCount: "1"}); // yes, user portal uses a string
      break;
    case "small":
      Object.assign(itemObj, {height: 3, width: 9, depth: 9});
      break;
    case "medium":
      Object.assign(itemObj, {height: 9, width: 9, depth: 12});
      break;
    case "large":
      Object.assign(itemObj, {height: 9, width: 12, depth: 18});
      break;
    case "full":
      Object.assign(itemObj, {height: 12, width: 18, depth: 18});
      break;
    default:
      throw new Error(`Illegal box size '${size}'`);
  }

  // CAREFUL: our client-facing API uses dash-case for parameters,
  // whereas our internal API uses CamelCase / kindaCamelCase
  let getAddressObj = (addressType) => {
    return {
      "line1": req.body[addressType]["line-1"],
      "line2": req.body[addressType]["line-2"],
      "state": req.body[addressType].state,
      "city": req.body[addressType].city,
      "zip": req.body[addressType].zip,
      "location": {
        "latitude": req.body[addressType].location.latitude,
        "longitude": req.body[addressType].location.longitude
      },
      "company": req.body[addressType].company,
      "contactName": req.body[addressType]["contact-name"],
      "phone": req.body[addressType].phone
    };
  };

  let packageModel = {
    "recipient": {
      "note": deliveryNote,
      "isSignatureRequired": false
    },
    "fromAddress": getAddressObj("from-address"),
    "toAddress": getAddressObj("to-address"),
    "isExpedited": false,
    "promoCode": "",
    "sourceHub": {}, // it looks hubs get reset server side once we make the call
    "destinationHub": {},
    "deliveryTimeId": 1, // based on prod db this is always a 1
    "pickupNote": pickupNote,
    "discount": 0,
    "UserId": userID,
    "DeliveryMethodId": "1", // 1 is pickup and 2 is delivery (yep, a string, not an int)
    "dueDate": dueDate,
    "items": [itemObj],
    "promoCodeId": ""
  };

  res.json({packageModel: packageModel});
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
    case "envelope":
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
  const errors = ev.validationResult(req);
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
