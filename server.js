/* jshint node: true */
"use strict";

let express = require('express');
let bodyParser = require('body-parser');
let mongodb = require('mongodb');

const MONGO_SERVER = "localhost:27017";
const DATABASE = "rynly";
const PORT = 8081;

let MongoClient = mongodb.MongoClient;

// setup db
const mongoUrl = `mongodb://${MONGO_SERVER}/${DATABASE}`;
let mongoQuery = function(callback) { // callback takes db as a params
  MongoClient.connect(mongoUrl, {useNewUrlParser: true}, (err, raw_db) => {
    if (err) throw err;
    let db = raw_db.db(DATABASE);
    callback(db);
    raw_db.close();
  });
};

mongoQuery((db) => {
  console.log(`Database connection to ${mongoUrl} successful`);
});

// setup server
const app = express();

// app.use("api/v1", router);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let getZips = function(res) {

  // need closure around `res`
  let _getZips = function(db) {
    db.collection("Hubs").findOne({"ZipZones.ZipCode": "97202"}, (err, item) => {
      res.json(item);
    });
  };

  mongoQuery(_getZips);
};

app.get("/api/v1/service_area", (req, res) => {
  logRequest(req);

  let source = req.body.source;
  let destination = req.body.destination;

  getZips(res);
});

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
});


// HELPERS

function logRequest(req) {
  console.log(`${req.method} ${req.originalUrl} ${getIP(req)}`);
}

function getIP(req) {
  // Careful: req.ip doesn't work if we're behind an nginx proxy!
  // https://stackoverflow.com/questions/8107856/how-to-determine-a-users-ip-address-in-node
  let raw_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  return raw_ip.split(",")[0].trim();
}
