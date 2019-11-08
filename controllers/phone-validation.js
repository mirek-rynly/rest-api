/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
let ev = require("express-validator");

const { RYNLY_SERVER_URL } = require("../config.js");

exports.GET_VALIDATOR = [
  ev.query("phone-number").exists().withMessage("required param missing")
];

exports.getValidatedNumber = (req, res, next) => {
  let inputPhone = req.query["phone-number"];
  let authToken = req.headers.authorization.trim();
  const url = `${RYNLY_SERVER_URL}/api/user/validatePhone`;
  let options = {
    params: { phone: inputPhone },
    headers: { Authorization: authToken }
  };

  // Note that even if the phone number fails to validate, the REQUEST will still
  // succeed and return a 200. We'll need to view the response contents to determine
  // whether or not the phone number is valid.
  console.log(`Making phone validation GET request to '${url}' with options ${JSON.stringify(options)}`);
  axios.get(url, options).then(axiosRes => {
    console.log('got" _' + JSON.stringify(axiosRes.data))
    res.json(axiosRes.data);
  }).catch(axiosErr => {
    console.error(axiosErr);
    let err = new Error("Internal error validating phone number");
    next(err);
  });
};
