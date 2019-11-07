/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
let ev = require("express-validator");

exports.GET_VALIDATOR = [
  ev.query("phone-number").exists().withMessage("required param missing")
];

exports.getValidatedNumber = (req, res, next) => {
  const url = 'http://localhost:8082/api/user/validatePhone';
  const cookie = "RynlyAccessToken=%2BRjECzm8Xk9Y%2BboADaS4FZu2%2FBjR0aBZ9cT8cXRzW59Va5xOgJpXoI1G%2F8DxuRGg;";
  let inputPhone = req.query["phone-number"];
  let options = {
    params: { phone: inputPhone },
    headers: {
      Cookie: cookie
    },
  };

  // Note that even if the phone number fails to validate, the REQUEST will still
  // succeed and return a 200. We'll need to view the response contents to determine
  // whether or not the phone number is valid.
  console.log(`Making phone validation request to '${url}' with options ${JSON.stringify(options)}`);
  axios.get(url, options)
    .then((innerRes) => {
      console.log("Phone validation response:");
      console.log(innerRes.data);
      res.send(innerRes.data);
    })
    .catch((innerErr) => {
      // something went wrong with the request itself (e.g. authentication failed)
      console.error("Phone validation request failure:");
      innerErr.message = "Internal error validating phone number, token might be expired";
      next(innerErr);
    });
};
