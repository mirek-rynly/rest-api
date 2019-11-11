/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let database = require("../database.js");
let utils = require("../utils.js");

exports.GET_VALIDATOR = [
  ev.query("from_zip").exists().withMessage("required param missing"),
  ev.query("to_zip").exists().withMessage("required param missing")
];

exports.getServiceAvailability = (res, req, next) => {
  let fromZip = req.query.from_zip;
  let toZip = req.query.to_zip;

  let db = database.get();
  let fromZipQuery = {"ZipZones.ZipCode": fromZip, "ZipZones": {$exists: true, $ne: null}};
  // CAREFULL: we can't use `.countDocuments` with read-only azure permission
  // (this call is treated as "running an arbitrary function" as opposed just "reading data"
  // TODO: projection to have less data coming over the wire
  // (ideally just use the cursoe instead of toArray)
  db.collection("Hubs").find(fromZipQuery).toArray((err, fromHubs) => {
    if (err) {
      return next(err);
    }

    let fromHubNames = fromHubs.map(hub => hub.Code);
    console.log(`Hubs servicing from_zip '${fromZip}': ${JSON.stringify(fromHubNames)}`);
    if (fromHubs.length === 0) {
      return res.json({ "service_availability": false });
    }

    let destZipQuery = {"ZipZones.ZipCode": toZip, "ZipZones": {$exists: true, $ne: null}};
    db.collection("Hubs").find(destZipQuery).toArray((err, toHubs) => {
      if (err) {
        return next(err);
      }
      let toHubNames = toHubs.map(hub => hub.Code);
      console.log(`Hubs servicing to_zip '${toZip}': ${JSON.stringify(toHubNames)}`);

      if (toHubs.length === 0) {
        return res.json({ "service_availability": false });
      }

      res.json({ "service_availability": true });
    });
  });
};
