/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let database = require("../database.js");
let utils = require("../utils.js");

exports.GET_VALIDATOR = [
  ev.query("from-zip").exists().withMessage("required param missing"),
  ev.query("to-zip").exists().withMessage("required param missing")
];

exports.getServiceAvailability = (res, req, next) => {
  let fromZip = req.query["from-zip"];
  let toZip = req.query["to-zip"];

  let db = database.get();
  let fromZipQuery = {"ZipZones.ZipCode": fromZip, "ZipZones": {$exists: true, $ne: null}};
  // CAREFULL: we can't use `.countDocuments` with read-only azure permission
  // (this call is treated as "running an arbitrary function" as opposed just "reading data"
  // TODO: projection to have less data coming over the wire
  // (ideally just use the cursoe instead of toArray)
  db.collection("Hubs").find(fromZipQuery).toArray((err, sourceHubs) => {
    if (err) {
      return next(err);
    }

    console.log(`Hubs servicing source '${fromZip}': ${sourceHubs}`);
    if (sourceHubs.length === 0) {
      return res.json({ service_availability: false });
    }

    let destZipQuery = {"ZipZones.ZipCode": toZip, "ZipZones": {$exists: true, $ne: null}};
    db.collection("Hubs").find(destZipQuery).toArray((err, destHubs) => {
      if (err) {
        return next(err);
      }
      console.log(`Hubs servicing destination '${toZip}': ${destHubs.length}`);

      if (destHubs.length === 0) {
        return res.json({ service_availability: false });
      }

      res.json({ service_availability: true });
    });
  });
};
