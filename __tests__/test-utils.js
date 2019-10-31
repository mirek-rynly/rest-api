/* jshint node: true */

"use strict";

exports.missingParamMsg = (paramName, expectedValue) => {
  return {location : "query", msg: "required param missing", param: paramName, value: null};
};
