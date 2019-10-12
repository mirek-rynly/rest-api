/* jshint node: true */
"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PORT = 8081;
const app = express();

// app.use("api/v1");
// app.use("api/v1", router);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({message: "Hello World"});
});

app.listen(PORT, () => {
  console.log('Server started');
});
