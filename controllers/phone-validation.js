/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
let ev = require("express-validator");

exports.GET_VALIDATOR = [
  ev.query("phone-number").exists().withMessage("required param missing")
];

exports.getValidatedNumber = (req, res, next) => {

  // HACK: since called uses callbacks instead of async, we need to wrap in an anonymous call
  (async (_req, _res, _next) => {
    let inputPhone = _req.query["phone-number"];
    let axiosRes;
    try {
      axiosRes = await rynlyServerPhoneValidation(inputPhone);
    } catch(axiosErr) {
      // something went wrong with the request itself (e.g. authentication failed)
      console.error("Phone validation request failure:");
      axiosErr.message = "Internal error validating phone number, authentication likely failed";
      _next(axiosErr);
    }
    _res.send(axiosRes.data);
  })(req, res, next);
};

// HACK: exporting since this is an easy way to check that we have a legit token
// careful, this function might throw an exception!
let rynlyServerPhoneValidation = exports.rynlyServerPhoneValidation = async (inputPhone) => {
  const url = 'https://uatuser.rynly.com/api/user/validatePhone';
  const cookie = "RynlyAccessToken=%2BRjECzm8Xk9Y%2BboADaS4FZu2%2FBjR0aBZ9cT8cXRzW59Va5xOgJpXoI1G%2F8DxuRGg;";
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
  let axiosRes = await axios.get(url, options);
  console.log("Phone validation response:");
  console.log(axiosRes.data);
  return axiosRes;
};
