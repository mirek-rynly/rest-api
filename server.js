/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
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

// Rynly.Platform.Shared.Enumerations.Enum.PackageStatus
const PACKAGE_STATUS_MAP = {
  0: "Created",
  1: "Picked By Driver",
  2: "Checked In",
  3: "In Transit",
  4: "Out for Delivery",
  5: "Delivered",
  6: "Return to Hub",
  7: "Cancelled"
};

// GET package status
const PACKAGE_VALIDATION = [
  ev.query("tracking-number").exists().withMessage("required param missing").bail()
    .isLength({min:14, max: 14}).withMessage("must be 14 character string")
    .isAlphanumeric().withMessage("must be alphanumeric string")
];
app.get("/api/v1/package", PACKAGE_VALIDATION, (req, res, next) => {
  if (validationErrors(req, res)) return;

  let trackingNumber = req.query["tracking-number"];
  let db = database.get();

  db.collection("Packages").find({"TrackingNumber": trackingNumber}, {
    projection: {
      "DateCreated": 1,
      "TrackingNumber": 1,
      "From": 1,
      "To": 1,
      "Items": 1, // how we'll determine "size"
      "IsExpedited": 1,
      "PickupNote": 1,
      "DeliveryNote": 1,
      "DueDate": 1,
      "Status": 1,
      "Changes": 1
    }
  }).toArray((err, dbPackages) => {
    if (err) {
      next(err);
      return;
    }
    console.log(`Package query result: '${JSON.stringify(dbPackages, null, 2)}'`);
    if (dbPackages.length === 0) {
      let err = new Error(`No package found for '${trackingNumber}'`);
      err.statusCode = 404; // not found
      next(err);
      return;
    }

    if (dbPackages.length !== 1) {
      let err = new Error(`Multiple packages (${dbPackages.legth}) found for '${trackingNumber}'`);
      err.statusCode = 500; // internal server error
      next(err);
      return;
    }

    let dbPackage = dbPackages[0]; // 'package' is a reserved word

    // convert from address object as stored in the DB to the
    // external-facing address format
    let externalApiAddress = (dbAddress) => {
      return {
        "line-1": dbAddress.Line1,
        "line-2": dbAddress.Line2,
        state: dbAddress.State,
        city: dbAddress.City,
        zip: dbAddress.Zip,
        coordinates: {
          latitude: dbAddress.Location.coordinates[1], // yea, we store coordinates backwards
          longitude: dbAddress.Location.coordinates[0]
        },
        company: dbAddress.Company,
        "contact-name": dbAddress.ContactName,
        phone: dbAddress.Phone
      };
    };

    let packageSize = (dbPackage) => {
      let item = dbPackage.Items[0];
      return(itemObjToSize(item));
    };

    // e.g. [{ date: X, status: "Created"}]
    let externalStatusChanges = (dbPackage) =>{
      let externalChanges = [];
      for (let dbChange of dbPackage.Changes) {
        externalChanges.push({
          date: dbChange.Date,
          status: PACKAGE_STATUS_MAP[dbChange.Status]
        });
      }
      return externalChanges;
    };

    // e.g. "/package/label/23d58b12-5542-4920-99fa-f072509df92b"
    let labelUrl = `/package/label/${dbPackage._id}`;

    res.json({
      "date-created": dbPackage.DateCreated,
      "tracking-number": dbPackage.TrackingNumber,
      "from-address": externalApiAddress(dbPackage.From),
      "to-address": externalApiAddress(dbPackage.To),
      "size": packageSize(dbPackage),
      "is-expedited": dbPackage.IsExpedited,
      "pickup-note": dbPackage.PickupNote,
      "delivery-note": dbPackage.DeliveryNote,
      "due-date": dbPackage.DueDate,
      "current-status": PACKAGE_STATUS_MAP[dbPackage.Status],
      "status-changes": externalStatusChanges(dbPackage),
      "label-url": labelUrl,
    });
  });
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


// for the given client facing "size" (e.g. "medium"), return the corresponding
// internal representation (e.g. {type: 0, envelopeCount: 0, height: 9, width: 9, depth: 12})
let sizeToItemObj = (size) => {
  // this is how we model package size on the backend :(
  // envelope is type=0 and envelopeCount="1" with zero dimensions
  // everything else is type=1 and non-zero dimensions
  let itemObj = {type: 1, envelopeCount: 0, height: 0, width: 0, depth: 0};
  switch (size) {
    case "envelope":
      return Object.assign(itemObj, {type: 0, envelopeCount: "1"}); // yes, user portal uses a string
    case "small":
      return Object.assign(itemObj, {height: 3, width: 9, depth: 9});
    case "medium":
      return Object.assign(itemObj, {height: 9, width: 9, depth: 12});
    case "large":
      return Object.assign(itemObj, {height: 9, width: 12, depth: 18});
    case "full":
      return Object.assign(itemObj, {height: 12, width: 18, depth: 18});
    default:
      break;
  }
  throw new Error(`Illegal box size '${size}'`);
};


let itemObjToSize = (itemObj) => {
  let {Type:type, EnvelopeCount, Height:h, Width:w, Depth:d} = itemObj;
  if (type === 0) {
    return "envelope";
  } else if (type === 1) {
    switch(true) { // use switch as closure
      case h === 3 && w === 9 && d === 9:
        return "small";
      case h === 9 && w === 9 && d === 12:
        return "medium";
      case h === 9 && w === 12 && d === 18:
        return "large";
      case h === 12 && w === 18 && d === 18:
        return "full";
      default:
        throw new Error(`illegal box dimensions (h, w, d)=(${h}, ${w}, ${d}')`);
    }
  }

  throw new Error(`unrecognized package type '${JSON.stringify(itemObj)}`);
};

//tests
// let itemObj = {type: 2, envelopeCount: 0, height: 0, width: 0, depth: 0};
// Object.assign(itemObj, {height: 9, width: 12, depth: 18});

// console.log(itemObjToSize(itemObj));
// process.exit(1);


app.post("/api/v1/new-order", newOrderValidation(), (req, res, next) => {
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
    "items": [sizeToItemObj(size)],
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


const PHONE_VALIDATION = [
  ev.query("phone").exists().withMessage("required param missing")
];
app.get("/api/v1/server-validated-phone", PHONE_VALIDATION, (req, res, next) => {
  if (validationErrors(req, res)) return;

  let inputPhone = req.query.phone;

  const url = 'http://localhost:8082/api/user/validatePhone';
  const cookie = "RynlyAccessToken=%2BRjECzm8Xk9Y%2BboADaS4FZu2%2FBjR0aBZ9cT8cXRzW59Va5xOgJpXoI1G%2F8DxuRGg;";
  let options = {
    params: { phone: inputPhone },
    headers: {
      Cookie: cookie
    },
  };

  // Note that even if the phone number fails to validate, the REQUEST will still
  // succeed and return a 200. We'll need to view the response contents to determine
  // whether or not the phone number is valid.
  console.log(`Making phone validation request to '${url}' with options ${JSON.stringify(options)}`);
  axios.get(url, options)
    .then((innerRes) => {
      console.log("Phone validation response:");
      console.log(innerRes.data);
      res.send(innerRes.data);
    })
    .catch((innerErr) => {
      // something went wrong with the request itself (e.g. authentication failed)
      console.error("Phone validation request failure:");
      innerErr.message = "Internal error validating phone number, token might be expired";
      next(innerErr);
    });
});


// default error catching middleware (validation handles its own error reporting)
app.use((err, req, res, next) => {
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
