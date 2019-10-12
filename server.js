/* jshint node: true */
"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');

const MONGO_SERVER = "localhost:27017";
const DATABASE = "rynly";
const PORT = 8081;

const MongoClient = mongodb.MongoClient;

// setup db
const mongoUrl = `mongodb://${MONGO_SERVER}/${DATABASE}`;
let mongoQuery = function(callback) {
  MongoClient.connect(mongoUrl, {useNewUrlParser: true}, (err, db) => {
    if (err) throw err;
    callback(db);
    db.close();
  });
};

mongoQuery((db) => {
  console.log(`Database connection to ${mongoUrl} successful`);
});

// setup server
const app = express();

// app.use("api/v1");
// app.use("api/v1", router);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/api/v1/hubs", (req, res) => {
  res.json({message: "Hello World"});
});

app.listen(PORT, () => {
  console.log("Express server started");
});

