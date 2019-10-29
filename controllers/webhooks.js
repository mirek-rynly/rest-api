/* jshint node: true */
"use strict";

require("log-timestamp");
let ev = require("express-validator");
let onDiskDB = require("../on-disk-database.js");

const EVENT_TYPES = ["package.update"];

exports.GET_ALL_VALIDATOR = [];
exports.getAllWebhooks = (req, res, next) => {
  (async () => {
    let db = onDiskDB.get();
    let x = await db.getItem('fibonacci');
    console.log("got " + x + ' sending as res');
    res.json(x);
  })().catch(err => next(err));
};

exports.GET_VALIDATOR = [];
exports.getWebhook = (req, res, next) => {
};

exports.POST_VALIDATOR = [
  ev.body("url").exists().withMessage("required param missing").bail()
    .isURL().withMessage("not a valid url")
];
exports.postWebhook = (req, res, next) => {
  (async () => {
    let db = onDiskDB.get();
    let url = req.body.url;
    let x = await db.setItem('fibonacci', url);
    console.log("setting fibonacci as " + url);
    res.json(x);
  })().catch(err => next(err));

};


