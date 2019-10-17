/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
let express = require("express");
let bodyParser = require("body-parser");
let ev = require("express-validator");

let utils = require("./utils.js");
let database = require("./database.js");
let quotes = require("./controllers/quotes.js");
let packages = require("./controllers/packages.js");
let phone = require("./controllers/phone-validation.js");

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

var apiRouter = express.Router();
app.use('/api/v1', apiRouter);

// GET service_availability
const AVAILABILITY_VALIDATION = [
  ev.query("source").exists().withMessage("required param missing"),
  ev.query("destination").exists().withMessage("required param missing")
];
apiRouter.get("/service-availability", AVAILABILITY_VALIDATION, (req, res, next) => {
  if (validationErrors(req, res)) return;
  let sourceZip = req.query.source;
  let destinationZip = req.query.destination;
  checkServiceAvailability(sourceZip, destinationZip, res, next);
});


// GET quote
apiRouter.get("/quote", quotes.QUOTE_VALIDATION, (req, res, next) => {
  if (validationErrors(req, res)) return;
  quotes.getQuote(req, res, next);
});



// GET package (this should require authentication - eventually)
apiRouter.get("/package/:trackingNumber", packages.PACKAGE_REQUEST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;

  // CAREFUL: unlike client-facing query parameters (e.g. /route?query-param=X),
  // internal routes parameter names (e.g /route/:routeParamName) can't have dashes
  let trackingNumber = req.params.trackingNumber;

  // TODO: don't pass in res and next, do error handling here
  packages.getPackage(trackingNumber, res, next);
});


// POST new package order

let addressValidation = (addressType) =>{
  let validator = [];
  let requiredFields = ["line-1", "city", "state", "zip", "contact-name", "phone"];
  requiredFields.push("coordinates", "coordinates.latitude", "coordinates.longitude");
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
  validator.push(ev.body(`${addressType}.coordinates.latitude`).isDecimal().withMessage("not a valid decimal"));
  validator.push(ev.body(`${addressType}.coordinates.longitude`).isDecimal().withMessage("not a valid decimal"));

  return validator;
};


// TODO: still need to validate that the "from" and "to" zip codes are in the service
// area, as this info is used for package creation
let newOrderValidation = () => {
  let validator = [
    ev.body("size").exists().withMessage("required param missing").bail()
      .isIn(utils.BOX_SIZES).withMessage(`must be one of [${utils.BOX_SIZES}]`),
    ev.body("pickup-note").if(ev.body("pickup-note").exists())
      .isLength({max: 90}).withMessage("max length is 90"),
    ev.body("delivery-note").if(ev.body("delivery-note").exists())
      .isLength({max: 90}).withMessage("max length is 90")
  ];
  validator.push(...addressValidation("from-address"));
  validator.push(...addressValidation("to-address"));
  return validator;
};

//tests
// let itemObj = {type: 2, envelopeCount: 0, height: 0, width: 0, depth: 0};
// Object.assign(itemObj, {height: 9, width: 12, depth: 18});

// console.log(itemObjToSize(itemObj));
// process.exit(1);


apiRouter.post("/new-order", newOrderValidation(), (req, res, next) => {
  if (validationErrors(req, res)) return;

  let size = req.body.size;
  let pickupNote = req.body["pickup-note"] ? req.body["pickup-note"] : "";
  let deliveryNote = req.body["delivery-note"] ? req.body["delivery-note"] : "";
  let userID = "cdacc808-1efa-47e7-9a50-a78aa0801efb"; // TODO

  // CAREFUL: our client-facing API uses dash-case for parameters,
  // whereas our internal API uses CamelCase / kindaCamelCase
  let internalApiAddress = (req, addressType) => {
    return {
      "line1": req.body[addressType]["line-1"],
      "line2": req.body[addressType]["line-2"],
      "state": req.body[addressType].state,
      "city": req.body[addressType].city,
      "zip": req.body[addressType].zip,
      "location": { // CAREFUL: externall "coordinates", internally "location"
        "latitude": req.body[addressType].coordinates.latitude,
        "longitude": req.body[addressType].coordinates.longitude
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
    "fromAddress": internalApiAddress(req, "from-address"),
    "toAddress": internalApiAddress(req, "to-address"),
    "isExpedited": false,
    "promoCode": "",
    "sourceHub": {}, // it looks hubs get reset server side once we make the call
    "destinationHub": {},
    "deliveryTimeId": 1, // based on prod db this is always a 1
    "pickupNote": pickupNote,
    "discount": 0,
    "UserId": userID,
    "DeliveryMethodId": 2, // 2 is pickup and 1 is delivery
    "items": [utils.sizeToItemObj(size)],
    "promoCodeId": ""
  };

  // THE REST REQUEST
  const url = 'http://localhost:8082/api/package/createmultiplepackage';
  const cookie = "RynlyAccessToken=%2BRjECzm8Xk9Y%2BboADaS4FZu2%2FBjR0aBZ9cT8cXRzW59Va5xOgJpXoI1G%2F8DxuRGg;";
  let options = {
    headers: {
      Cookie: cookie
    },
  };

  let payload = {
    packageCreateModels: [packageModel]
  };

  console.log(`Making package creation request to '${url}' with options ${JSON.stringify(options)}`);
  axios.post(url, payload, options)
    .then((innerRes) => {
      console.log("Package creation response:");
      console.log(innerRes.data);

      if (!innerRes.data.success) {
        console.error("Package creation response was 200 but data indicated error");
        next(innerRes.data.errors);
      }

      let packageCount = innerRes.data.data.packageResponseList.length;
      if (packageCount !== 1) {
        next("Expected exactly 1 package response, got " + packageCount);
      }

      let packageObj = innerRes.data.data.packageResponseList[0].package;

      res.send({
        "tracking-number": packageObj.trackingNumber,
        "due-date": packageObj.dueDate,
        "label-url": innerRes.data.data.packageResponseList[0].labelUrl // yea, not part of ".package"
      });
    })
    .catch((innerErr) => {
      console.error("Package creation request failed");
      next(innerErr);
    });
});


// GET validated phone number
apiRouter.get("/validated-phone-number", phone.REQUEST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  let inputPhoneNumber = req.query["phone-number"];
  phone.getValidatedNumber(inputPhoneNumber, res, next);
});


// default error catching middleware (validation handles its own error reporting)
apiRouter.use((err, req, res, next) => {
  console.error(err.message);
  console.error(err.stack);
  if (!err.statusCode) err.statusCode = 500;
  // make sure error format is consistent with parameter validation errors

  // TODO: if err is an array this isn't quite right
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


// LOCAL UTILS

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
