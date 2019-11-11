/* jshint node: true */
"use strict";

require("log-timestamp");
let axios = require("axios");
const { RYNLY_SERVER_URL } = require("../config.js");

exports.GET_VALIDATOR = [];
exports.getUserProfile = (req, res, next) => {
  let authToken = req.headers.authorization.trim();
  _getUserProfile(authToken)
    .then(userRes => res.json({ "user": userRes }))
    .catch(axiosErr => {
      console.error("inner profile request failure:");
      console.error(axiosErr);
      let err = new Error("Internal error fetching user ID");
      next(err);
    });
};

let _getUserProfile = async (authToken) => {
  const url = `${RYNLY_SERVER_URL}/api/user/profile`;
  let options = { headers: { Authorization: authToken } }; // careful, auth token can't be url encoded!
  console.log(`Making user profile POST request to '${url}' with options ${JSON.stringify(options)}`);
  let axiosRes = await axios.post(url, {}, options); // yea, its a post for some reason
  return axiosRes.data.data;
};

exports._getUserProfile = _getUserProfile;
