/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
let express = require("express");
let bodyParser = require("body-parser");
let ev = require("express-validator");

let utils = require("./utils.js");
let availability = require("./controllers/service-availability.js");
let quotes = require("./controllers/quotes.js");
let packages = require("./controllers/packages.js");
let orders = require("./controllers/orders.js");
let phone = require("./controllers/phone-validation.js");
let webhooks = require("./controllers/webhooks.js");

const TEST_TOKEN = "testtoken123";

let app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use((req, res, next) => { // log every request
  console.log(`${req.method} ${req.originalUrl} ${getIP(req)}`);
  next();
});

// don't silently remove items with "undefined" values
// https://stackoverflow.com/questions/40059338/response-json-not-showing-fields-with-value-undefined
app.set('json replacer', function (key, value) {
    if (typeof value === "undefined") {
      return null;
    }
    return value;
  }
);

var apiRouter = express.Router();
app.use('/api/v1', apiRouter);

// ROUTES THAT DON'T NEED AUTH

// GET /service-availability?source=97202&destination=97202
apiRouter.get("/service-availability", availability.REQUEST_VALIDATION, (req, res, next) => {
  if (validationErrors(req, res)) return;
  availability.getServiceAvailability(res, req, next);
});

// GET /quote?is-expedited=true&size=large
apiRouter.get("/quote", quotes.QUOTE_REQUEST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  quotes.getQuote(req, res, next);
});

// GET /validated-phone-number?phone-number=+1 971 222 9649 ex1
apiRouter.get("/validated-phone-number", phone.REQUEST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  let inputPhoneNumber = req.query["phone-number"];
  phone.getValidatedNumber(inputPhoneNumber, res, next);
});


// ROUTES THAT NEED AUTH

// auth midleware
apiRouter.use((req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    let err = new Error("no 'Authorization' header");
    err.statusCode = 401; // authentication error
    return next(err);
  }

  let token = authHeader.trim();
  if (token !== TEST_TOKEN) {
    let err = new Error("unrecognized token");
    err.statusCode = 401;
    return next(err);
  }

  next();
});

// GET /package/KM30784144blr1
apiRouter.get("/package/:trackingNumber", packages.PACKAGE_REQUEST_VALIDATOR, (req, res, next) => {
  // TODO: this should eventually require authentication (addresses expose PII)
  if (validationErrors(req, res)) return;
  packages.getPackage(req, res, next);
});

// POST /new-order
apiRouter.post("/new-order", orders.orderRequestValidator(), (req, res, next) => {
  if (validationErrors(req, res)) return;
  orders.postOrder(req, res, next);
});


//////////////////// WEBHOOKS

// GET /webhooks/
apiRouter.get("/webhooks", webhooks.GET_ALL_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  webhooks.getAllWebhooks(req, res, next);
});

// GET /webhook/:trackingNumber/
apiRouter.get("/webhook/:trackingNumber", webhooks.GET_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  webhooks.getWebhook(req, res, next);
});

// POST /webhook/
apiRouter.post("/webhook", webhooks.POST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  webhooks.postWebhook(req, res, next);
});

// DELETE /webhook/:trackingNumber/
apiRouter.delete("/webhook/:trackingNumber", webhooks.DELETE_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  webhooks.deleteWebhook(req, res, next);
});

// POST /webhook/trigger/
apiRouter.post("/webhook/trigger/", webhooks.TRIGGER_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  webhooks.triggerWebhook(req, res, next);
});


// error catching middleware, meant to catch generic exceptions (ie the `err` object)
// special error responses (e.g validation errors) might be handled independently,
// since we might have multiple errors
apiRouter.use((err, req, res, next) => {
  console.log("Fallback to generic error catching middleware");
  console.error(err.stack);
  if (!err.statusCode) err.statusCode = 500;
  // this ensures error format is consistent with parameter validation errors
  res.status(err.statusCode).json(
    {"errors": [{"msg": err.message}]}
  );
});


// HELPERS

// validation errors are handled manually (instead of using our error catching middleware),
// since we might have multiple error objects we want to return
let validationErrors = (req, res) => {
  const errors = ev.validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({"errors": errors.array()});
    return true;
  }
  return false;
};

let getIP = (req) => {
  // Careful: req.ip doesn't work if we're behind an nginx proxy!
  // https://stackoverflow.com/questions/8107856/how-to-determine-a-users-ip-address-in-node
  let raw_ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
  return raw_ip.split(",")[0].trim();
};

module.exports = app;
