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




let getHub = function(res) {
  console.log("outer");

  // need closure around res
  let _getHub = function(db) {
    console.log("ereh");
    db.collection("Hubs").find({Code: "PDX4"}).each((err, item) => {
      console.log(item);
      res.json(item);
    });
  };

  mongoQuery(_getHub);
};

app.get("/api/v1/hubs", (req, res) => {
  console.log("GET hubs");
  getHub(res);
});

app.listen(PORT, () => {
  console.log("Express server started");
});

