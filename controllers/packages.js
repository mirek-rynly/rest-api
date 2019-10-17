/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");

let utils = require("../utils.js");
let database = require("../database.js");

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

exports.PACKAGE_REQUEST_VALIDATOR = [
  ev.param("trackingNumber").exists().withMessage("required param missing").bail()
    .isLength({min:14, max: 14}).withMessage("must be 14 character string")
    .isAlphanumeric().withMessage("must be alphanumeric string")
];

exports.getPackage = (req, res, next) => {
  // CAREFUL: unlike client-facing query parameters (e.g. /route?query-param=X),
  // internal routes parameter names (e.g /route/:routeParamName) can't have dashes
  let trackingNumber = req.params.trackingNumber;
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
      return(utils.itemObjToSize(item));
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


};

