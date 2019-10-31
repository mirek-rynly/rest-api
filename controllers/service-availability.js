/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let database = require("../database.js");
let utils = require("../utils.js");

exports.GET_VALIDATOR = [
  ev.query("source").exists().withMessage("required param missing"),
  ev.query("destination").exists().withMessage("required param missing")
];

exports.getServiceAvailability = (res, req, next) => {
  let sourceZip = req.query.source;
  let destinationZip = req.query.destination;

  let db = database.get();
  let sourceZipQuery = {"ZipZones.ZipCode": sourceZip, "ZipZones": {$exists: true, $ne: null}};
  // CAREFULL: we can't use `.countDocuments` with read-only azure permission
  // (this call is treated as "running an arbitrary function" as opposed just "reading data"
  // TODO: projection to have less data coming over the wire
  // (ideally just use the cursoe instead of toArray)
  db.collection("Hubs").find(sourceZipQuery).toArray((err, sourceHubs) => {
    if (err) {
      return next(err);
    }

    console.log(`Hubs servicing source '${sourceZip}': ${sourceHubs}`);
    if (sourceHubs.length === 0) {
      return res.json({ service_availability: false });
    }

    let destZipQuery = {"ZipZones.ZipCode": destinationZip, "ZipZones": {$exists: true, $ne: null}};
    db.collection("Hubs").find(destZipQuery).toArray((err, destHubs) => {
      if (err) {
        return next(err);
      }
      console.log(`Hubs servicing destination '${destinationZip}': ${destHubs.length}`);

      if (destHubs.length === 0) {
        return res.json({ service_availability: false });
      }

      res.json({ service_availability: true });
    });
  });
};
