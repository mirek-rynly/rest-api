/* jshint node: true */
"use strict";

require("log-timestamp");

// Package size constants
const ENVELOPE = exports.ENVELOPE = "envelope";
const SMALL = exports.SMALL = "small";
const MEDIUM = exports.MEDIUM = "medium";
const LARGE = exports.LARGE = "large";
const FULL = exports.FULL = "full";

const PACKAGE_SIZES = exports.PACKAGE_SIZES = [ENVELOPE, SMALL, MEDIUM, LARGE, FULL];


// for the given client facing "size" (e.g. "medium"), return the corresponding
// internal representation (e.g. {type: 0, envelopeCount: 0, height: 9, width: 9, depth: 12})
exports.sizeToItemObj = (size) => {
  // this is how we model package size on the backend :(
  // envelope is type=0 and envelopeCount="1" with zero dimensions
  // everything else is type=1 and non-zero dimensions
  let itemObj = {type: 1, envelopeCount: 0, height: 0, width: 0, depth: 0};
  switch (size) {
    case ENVELOPE:
      return Object.assign(itemObj, {type: 0, envelopeCount: "1"}); // yes, user portal uses a string
    case SMALL:
      return Object.assign(itemObj, {height: 3, width: 9, depth: 9});
    case MEDIUM:
      return Object.assign(itemObj, {height: 9, width: 9, depth: 12});
    case LARGE:
      return Object.assign(itemObj, {height: 9, width: 12, depth: 18});
    case FULL:
      return Object.assign(itemObj, {height: 12, width: 18, depth: 18});
    default:
      break;
  }
  throw new Error(`Illegal box size '${size}'`);
};

exports.itemObjToSize = (itemObj) => {
  let {Type:type, EnvelopeCount, Height:h, Width:w, Depth:d} = itemObj;
  if (type === 0) {
    return ENVELOPE;
  } else if (type === 1) {
    switch(true) { // use switch as closure
      case h === 3 && w === 9 && d === 9:
        return SMALL;
      case h === 9 && w === 9 && d === 12:
        return MEDIUM;
      case h === 9 && w === 12 && d === 18:
        return LARGE;
      case h === 12 && w === 18 && d === 18:
        return FULL;
      default:
        throw new Error(`illegal box dimensions (h, w, d)=(${h}, ${w}, ${d}')`);
    }
  }

  throw new Error(`unrecognized package type '${JSON.stringify(itemObj)}`);
};

Object.assign(exports, {

});
