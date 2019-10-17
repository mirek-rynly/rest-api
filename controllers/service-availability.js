/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let database = require("../database.js");
let utils = require("../utils.js");

exports.REQUEST_VALIDATION = [
  ev.query("source").exists().withMessage("required param missing"),
  ev.query("destination").exists().withMessage("required param missing")
];

exports.getServiceAvailability = (res, req, next) => {
  let sourceZip = req.query.source;
  let destinationZip = req.query.destination;

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
