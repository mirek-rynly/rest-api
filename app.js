/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
let express = require("express");
let bodyParser = require("body-parser");
let ev = require("express-validator");

let utils = require("./utils.js");
let availability = require("./controllers/service-availability.js");
let pricing = require("./controllers/pricing.js");
let deliveryDates = require("./controllers/delivery-dates.js");
let users = require("./controllers/users.js");
let packages = require("./controllers/packages.js");
let orders = require("./controllers/orders.js");
let phone = require("./controllers/phone-validation.js");
let webhooks = require("./controllers/webhooks.js");


//////////////////// SETUP + MIDDLEWARE

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

// use as middleware for routes that require auth
let authCheck = (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    let err = new Error("no 'Authorization' header");
    err.statusCode = 401; // authentication error
    return next(err);
  }

  // HACK: get profile as an authorization test
  let token = authHeader.trim();
  console.log("Validating token by fetching user");
  users._getUserProfile(token)
    .then(_ => next())
    .catch(axiosErr => {
      console.error(axiosErr);
      let err = new Error("token authentication failed");
      err.statusCode = 401; // authentication error
      next(err);
    });
};


////////////////////  ROUTES THAT DON'T NEED AUTH

// GET /service_availability?from_zip=97202&to_zip=97202
apiRouter.get("/service_availability", availability.GET_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  availability.getServiceAvailability(res, req, next);
});

// GET /pricing?is_expedited=true&size=large (both params are optional)
apiRouter.get("/pricing", pricing.GET_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  pricing.getPricing(req, res, next);
});

// GET /delivery_date?order_creation_timestamp=2019-02-25T12:39:45Z (param is optional)
apiRouter.get("/delivery_date", deliveryDates.GET_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  deliveryDates.getDeliveredByDate(req, res, next);
});


//////////////////// ROUTES THAT NEED AUTH

// GET /user (TEMP, used for debugging)
apiRouter.get("/user", authCheck, users.GET_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  users.getUserProfile(req, res, next);
});

// GET /validated_phone_number?phone_number=+1 971 222 9649 ex1
apiRouter.get("/validated_phone_number", authCheck, phone.GET_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  phone.getValidatedNumber(req, res, next);
});

// GET /package/:trackingNumber
apiRouter.get("/package/:trackingNumber", authCheck, packages.PACKAGE_REQUEST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  packages.getPackage(req, res, next);
});

// POST /package_order
apiRouter.post("/package_order", authCheck, orders.orderRequestValidator(), (req, res, next) => {
  if (validationErrors(req, res)) return;
  orders.postOrder(req, res, next);
});


//////////////////// WEBHOOKS

// GET /webhooks/
apiRouter.get("/webhooks", authCheck, webhooks.GET_ALL_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  webhooks.getAllWebhooks(req, res, next);
});

// GET /webhook/:trackingNumber/
apiRouter.get("/webhook/:trackingNumber", authCheck, webhooks.GET_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  webhooks.getWebhook(req, res, next);
});

// POST /webhook/
apiRouter.post("/webhook", authCheck, webhooks.POST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  webhooks.postWebhook(req, res, next);
});

// DELETE /webhook/:trackingNumber/
apiRouter.delete("/webhook/:trackingNumber", authCheck, webhooks.DELETE_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  webhooks.deleteWebhook(req, res, next);
});

// POST /webhook/trigger/
apiRouter.post("/webhook/trigger/", authCheck, webhooks.TRIGGER_VALIDATOR, (req, res, next) => {
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


//////////////////// HELPERS

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
