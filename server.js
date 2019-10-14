/* jshint node: true */
"use strict";

let express = require('express');
let bodyParser = require('body-parser');
let mongodb = require('mongodb');

const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "rynly";
const EXPRESS_PORT = 8081;

let MongoClient = mongodb.MongoClient;

// test db connection
MongoClient.connect(MONGO_URL, {useNewUrlParser: true}, (err, client) => {
  if (err) throw err;
  console.log(`DB_NAME connection to ${MONGO_URL} successful`);
});

// setup server
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// define routes
app.get("/api/v1/service_area", (req, res) => {
  logRequest(req);
  let sourceZip = req.query.source;
  let destinationZip = req.query.destination;

  if (!sourceZip || !destinationZip) {
    throw new Error(`Must provide 'source' and 'destination' params, you provided ${JSON.stringify(req.query)}`);
  }
  checkServiceArea(sourceZip, destinationZip, res);
});

// start server
app.listen(EXPRESS_PORT, () => {
  console.log(`Express server started on port ${EXPRESS_PORT}`);
});


// HELPERS

let checkServiceArea = (sourceZip, destinationZip, res) => {
  MongoClient.connect(MONGO_URL, {useNewUrlParser: true}, (err, client) => {
    if (err) throw err;
    let db = client.db(DB_NAME);

    let sourceZipQuery = {"ZipZones.ZipCode": sourceZip, "ZipZones": {$exists: true, $ne: null}};
    db.collection("Hubs").countDocuments(sourceZipQuery, (err, sourceCount) => {
      if (err) throw err;
      console.log(`Zip entry count for '${sourceZip}': ${sourceCount}`);
      if (sourceCount < 1) {
        res.json({ service_availability: false });
        client.close();
        return;
      }

      let destZipQuery = {"ZipZones.ZipCode": destinationZip, "ZipZones": {$exists: true, $ne: null}};
      db.collection("Hubs").countDocuments(destZipQuery, (err, destCount) => {
        if (err) throw err;
        console.log(`Zip entry count for '${destinationZip}': ${destCount}`);
        if (destCount < 1) {
          res.json({ service_availability: false });
          client.close();
          return;
        }

        res.json({ service_availability: true });
        client.close();
      });
    });
  });
};



// UTILS

function logRequest(req) {
  console.log(`${req.method} ${req.originalUrl} ${getIP(req)}`);
}

function getIP(req) {
  // Careful: req.ip doesn't work if we're behind an nginx proxy!
  // https://stackoverflow.com/questions/8107856/how-to-determine-a-users-ip-address-in-node
  let raw_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  return raw_ip.split(",")[0].trim();
}
