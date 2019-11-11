/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let utils = require("../utils.js");
let database = require("../database.js");

exports.PACKAGE_REQUEST_VALIDATOR = [
  ev.param("trackingNumber").exists().withMessage("required param missing").bail()
    .isAlphanumeric().withMessage("must be alphanumeric string")
];

exports.getPackage = (req, res, next) => {
  // CAREFUL: unlike client-facing query parameters (e.g. /route?query_param=X),
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
      "Recipient.Note": 1,
      "DueDate": 1,
      "Status": 1,
      "Changes": 1
    }
  }).toArray((err, dbPackages) => {
    if (err) {
      return next(err);
    }
    console.log(`Package query result: '${JSON.stringify(dbPackages, null, 2)}'`);
    if (dbPackages.length === 0) {
      let err = new Error(`No package found for '${trackingNumber}'`);
      err.statusCode = 404; // not found
      return next(err);
    }

    if (dbPackages.length !== 1) {
      let err = new Error(`Multiple packages (${dbPackages.length}) found for '${trackingNumber}'`);
      err.statusCode = 500; // internal server error
      return next(err);
    }

    let dbPackage = dbPackages[0]; // 'package' is a reserved word

    // convert from address object as stored in the DB to the
    // external-facing address format
    let externalApiAddress = (dbAddress) => {
      return {
        "line_1": dbAddress.Line1,
        "line_2": dbAddress.Line2,
        state: dbAddress.State,
        city: dbAddress.City,
        zip: dbAddress.Zip,
        coordinates: {
          latitude: dbAddress.Location.coordinates[1], // yea, we store coordinates backwards
          longitude: dbAddress.Location.coordinates[0]
        },
        company: dbAddress.Company,
        "contact_name": dbAddress.ContactName,
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
          status: utils.PACKAGE_STATUS_MAP[dbChange.Status]
        });
      }
      return externalChanges;
    };

    // e.g. "/package/label/23d58b12-5542-4920-99fa-f072509df92b"
    let labelUrl = `/package/label/${dbPackage._id}`;

    res.json({
      "date_created": dbPackage.DateCreated,
      "tracking_number": dbPackage.TrackingNumber,
      "from_address": externalApiAddress(dbPackage.From),
      "to_address": externalApiAddress(dbPackage.To),
      "size": packageSize(dbPackage),
      "is_expedited": dbPackage.IsExpedited,
      "pickup_note": dbPackage.PickupNote,
      "delivery_note": dbPackage.Recipient.Note,
      "due_date": dbPackage.DueDate,
      "current_status": utils.PACKAGE_STATUS_MAP[dbPackage.Status],
      "status_changes": externalStatusChanges(dbPackage),
      "label_url": labelUrl,
    });
  });
};




