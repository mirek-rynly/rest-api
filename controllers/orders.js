/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
let ev = require("express-validator");
let moment = require("moment-timezone");
let utils = require("../utils.js");

// TODO: still need to validate that the "from" and "to" zip codes are in the service
// area, as this info is used for package creation
exports.orderRequestValidator = () => {
  let validator = [
    ev.body("size").exists().withMessage("required param missing").bail()
      .isIn(utils.PACKAGE_SIZES).withMessage(`must be one of [${utils.PACKAGE_SIZES}]`),
    ev.body("pickup-note").if(ev.body("pickup-note").exists())
      .isLength({max: 90}).withMessage("max length is 90"),
    ev.body("delivery-note").if(ev.body("delivery-note").exists())
      .isLength({max: 90}).withMessage("max length is 90")
  ];
  validator.push(...addressValidation("from-address"));
  validator.push(...addressValidation("to-address"));
  return validator;
};

exports.postOrder = (req, res, next) => {
  let size = req.body.size;
  let pickupNote = req.body["pickup-note"] ? req.body["pickup-note"] : "";
  let deliveryNote = req.body["delivery-note"] ? req.body["delivery-note"] : "";
  let userID = "cdacc808-1efa-47e7-9a50-a78aa0801efb"; // TODO don't hardcode

  let packageModel = {
    "UserId": userID, // TODO don't hardcode
    "recipient": {
      "note": deliveryNote,
      "isSignatureRequired": false
    },
    "fromAddress": internalApiAddress(req, "from-address"),
    "toAddress": internalApiAddress(req, "to-address"),
    "isExpedited": false,
    "promoCode": "",
    "promoCodeId": "",
    "sourceHub": {}, // it looks hubs get reset server side once we make the call
    "destinationHub": {},
    "deliveryMethodId": 2, // 2 is pickup and 1 is deliver
    "deliveryTimeId": 1, // based on prod db this is always a 1
    "packagesCount": 1,
    "pickupNote": pickupNote,
    "discount": 0,
    "items": [utils.sizeToItemObj(size)],
  };

  // THE REST REQUEST
  const url = 'https://uatuser.rynly.com/api/package/createmultiplepackage';
  // const url = 'http://localhost:8082/api/package/createmultiplepackage';
  let authToken = req.headers.authorization.trim();
  let options = {
    headers: {
      Authorization: authToken
    },
  };

  let payload = {
    packageCreateModels: [packageModel],
    promoCode: ""
  };

  console.log(`Making package creation request to '${url}' with options ${JSON.stringify(options)}`);
  axios.post(url, payload, options)
    .then((innerRes) => {
      console.log("Package creation response:");
      console.log(innerRes.data);

      if (!innerRes.data.success) {
        console.error("Package creation response was 200 but data indicated error");
        return next(innerRes.data.errors);
      }

      let packageCount = innerRes.data.data.packageResponseList.length;
      if (packageCount !== 1) {
        return next("Expected exactly 1 package response, got " + packageCount);
      }

      let packageObj = innerRes.data.data.packageResponseList[0].package;

      // DB stores dates in UTC, convert to Pacific
      let dbDueDatetime = packageObj.dueDate;
      let dueDatePacific = moment(dbDueDatetime).tz('America/Los_Angeles').format("YYYY-MM-DD");

      res.send({
        "tracking-number": packageObj.trackingNumber,
        "due-date": dueDatePacific,
        "label-url": innerRes.data.data.packageResponseList[0].labelUrl // yea, not part of ".package"
      });
    })
    .catch((innerErr) => {
      console.error("Package creation request failed");
      next(innerErr);
    });
};


function addressValidation(addressType) {
  let validator = [];
  let requiredFields = ["line-1", "city", "state", "zip", "contact-name", "phone"];
  requiredFields.push("coordinates", "coordinates.latitude", "coordinates.longitude");
  for (let requiredField of requiredFields) {
    let fullName = `${addressType}.${requiredField}`;
    validator.push(ev.body(fullName).not().isEmpty().withMessage("required param missing or empty").bail());
  }

  // Our server requires valid US phone numbers, check here to fail fast
  // Examples that should pass both here and on the server include:
  // 971-222-9649, 9712229649, +1 971-222-9649, 19712229649
  //
  // However, our server allows extensions, whereas this validation logic does NOT
  // Examples that fail here and pass there:
  // 971-222-9649 ext. 8, 971-222-9649 ext.8, 971-222-9649 ext8, 971-222-9649 ex.8
  //
  // TODO: use our server route for validation
  validator.push(ev.body(`${addressType}.phone`).isMobilePhone("en-US").withMessage("not a valid phone number"));

  // Latitude / longitude validation
  validator.push(ev.body(`${addressType}.coordinates.latitude`).isDecimal().withMessage("not a valid decimal"));
  validator.push(ev.body(`${addressType}.coordinates.longitude`).isDecimal().withMessage("not a valid decimal"));

  return validator;
}

// the given request should include both a "from-address" and "to-address", with
// formatting as defined by our external-facing API.
//
// return the desired (to / from) address as given in our _internal_ API format (ie
// as given by Rynly.Platform.Shared.Models.Address)
let internalApiAddress = (req, addressType) => {
  if (addressType !== "from-address" && addressType !== "to-address") {
    throw new Error("Unexpected addressType " + addressType);
  }

  // CAREFUL: our client-facing API uses dash-case for parameters,
  // whereas our internal API uses CamelCase / kindaCamelCase
  return {
    "line1": req.body[addressType]["line-1"],
    "line2": req.body[addressType]["line-2"],
    "state": req.body[addressType].state,
    "city": req.body[addressType].city,
    "zip": req.body[addressType].zip,
    "location": { // CAREFUL: externall "coordinates", internally "location"
      "latitude": req.body[addressType].coordinates.latitude,
      "longitude": req.body[addressType].coordinates.longitude
    },
    "company": req.body[addressType].company,
    "contactName": req.body[addressType]["contact-name"],
    "phone": req.body[addressType].phone
  };
};
