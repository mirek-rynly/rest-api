/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
let express = require("express");
let bodyParser = require("body-parser");
let ev = require("express-validator");

let utils = require("./utils.js");
let database = require("./database.js");

let availability = require("./controllers/service-availability.js");
let quotes = require("./controllers/quotes.js");
let packages = require("./controllers/packages.js");
let orders = require("./controllers/orders.js");
let phone = require("./controllers/phone-validation.js");

const EXPRESS_PORT = 8081;

let app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} ${getIP(req)}`);
  next();
});

var apiRouter = express.Router();
app.use('/api/v1', apiRouter);

// GET service_availability
apiRouter.get("/service-availability", availability.REQUEST_VALIDATION, (req, res, next) => {
  if (validationErrors(req, res)) return;
});

// GET quote
apiRouter.get("/quote", quotes.QUOTE_REQUEST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  quotes.getQuote(req, res, next);
});


// GET package (this should require authentication - eventually)
apiRouter.get("/package/:trackingNumber", packages.PACKAGE_REQUEST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  packages.getPackage(req, res, next);
});


// POST new package order
apiRouter.post("/new-order", orders.orderRequestValidator(), (req, res, next) => {
  if (validationErrors(req, res)) return;
  orders.postOrder(req, res, next);
});


// GET validated phone number
apiRouter.get("/validated-phone-number", phone.REQUEST_VALIDATOR, (req, res, next) => {
  if (validationErrors(req, res)) return;
  let inputPhoneNumber = req.query["phone-number"];
  phone.getValidatedNumber(inputPhoneNumber, res, next);
});

// error catching middleware
apiRouter.use((err, req, res, next) => {
  console.error(err.message);
  console.error(err.stack);
  if (!err.statusCode) err.statusCode = 500;
  // make sure error format is consistent with parameter validation errors
  res.status(err.statusCode).send( // TODO: if err is an array this isn't quite right
    {"errors": [{msg: err.message}]}
  );
});

// connect to mongo and start server
database.connect()
  .then(() => {
    app.listen(EXPRESS_PORT, () => {
      console.log(`Express server started on port ${EXPRESS_PORT}`);
    });
  })
  .catch((err) => {
    console.error("Couldn't connect to mongo: ", err);
    process.exit(1); // Fail hard if we can't connect to the DB
  });


// helpers

let validationErrors = (req, res) => {
  const errors = ev.validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
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
