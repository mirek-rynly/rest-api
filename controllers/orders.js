/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
let ev = require("express-validator");
let moment = require("moment-timezone");
let utils = require("../utils.js");

const { RYNLY_SERVER_URL } = require("../config.js");

// TODO: still need to validate that the "from" and "to" zip codes are in the service
// area, as this info is used for package creation
exports.orderRequestValidator = () => {
  let validator = [
    ev.body("size").exists().withMessage("required param missing").bail()
      .isIn(utils.PACKAGE_SIZES).withMessage(`must be one of [${utils.PACKAGE_SIZES}]`),
    ev.body("is_expedited").exists().withMessage("required param missing").bail()
      .isBoolean().withMessage("must be one of [true,false]"),
    ev.body("pickup_note").if(ev.body("pickup_note").exists())
      .isLength({max: 90}).withMessage("max length is 90"),
    ev.body("delivery_note").if(ev.body("delivery_note").exists())
      .isLength({max: 90}).withMessage("max length is 90")
  ];
  validator.push(...addressValidation("from_address"));
  validator.push(...addressValidation("to_address"));
  return validator;
};

exports.postOrder = (req, res, next) => {
  let size = req.body.size;
  let isExpeditedRaw = req.body.is_expedited;
  let pickupNote = req.body.pickup_note ? req.body.pickup_note : "";
  let deliveryNote = req.body.delivery_note ? req.body.delivery_note : "";

  let isExpeditedBool;
  if (typeof isExpeditedRaw === "string") {
    isExpeditedBool = (isExpeditedRaw === "true" ? true : false);
  } else if (typeof isExpeditedRaw === "boolean") {
    isExpeditedBool = isExpeditedRaw;
  } else {
    let err = new Error(`Unexpected type for is_expedited parameter: '${typeof isExpeditedRaw}'`);
    next(err);
  }

  let packageModel = {
    "recipient": {
      "note": deliveryNote,
      "isSignatureRequired": false
    },
    "fromAddress": internalApiAddress(req, "from_address"),
    "toAddress": internalApiAddress(req, "to_address"),
    "isExpedited": isExpeditedBool,
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

  // THE INTERNAL REST REQUEST
  let authToken = req.headers.authorization.trim();
  const url = `${RYNLY_SERVER_URL}/api/package/createmultiplepackage`;
  let options = { headers: { Authorization: authToken } };

  let payload = {
    packageCreateModels: [packageModel],
    promoCode: ""
  };

  console.log(`Making package creation POST request to '${url}' with options ${JSON.stringify(options)}`);
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
        "tracking_number": packageObj.trackingNumber,
        "due_date": dueDatePacific,
        "label_url": innerRes.data.data.packageResponseList[0].labelUrl // yea, not part of ".package"
      });
    })
    .catch((innerErr) => {
      console.error("Package creation request failed");
      next(innerErr);
    });
};


let addressValidation = (addressType) => {
  let validator = [];
  let requiredFields = ["line_1", "city", "state", "zip", "contact_name", "phone"];
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
};

// the given request should include both a "from_address" and "to_address", with
// formatting as defined by our external-facing API.
//
// return the desired (to / from) address as given in our _internal_ API format (ie
// as given by Rynly.Platform.Shared.Models.Address)
let internalApiAddress = (req, addressType) => {
  if (addressType !== "from_address" && addressType !== "to_address") {
    throw new Error("Unexpected addressressType " + addressType);
  }

  // CAREFUL: our client-facing API uses dash-case for parameters,
  // whereas our internal API uses CamelCase / kindaCamelCase
  return {
    "line1": req.body[addressType].line_1,
    "line2": req.body[addressType].line_2,
    "state": req.body[addressType].state,
    "city": req.body[addressType].city,
    "zip": req.body[addressType].zip,
    "location": { // CAREFUL: externall "coordinates", internally "location"
      "latitude": req.body[addressType].coordinates.latitude,
      "longitude": req.body[addressType].coordinates.longitude
    },
    "company": req.body[addressType].company,
    "contactName": req.body[addressType].contact_name,
    "phone": req.body[addressType].phone
  };
};
