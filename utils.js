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

// Rynly.Platform.Shared.Enumerations.Enum.PackageStatus
exports.PACKAGE_STATUS_MAP = {
  0: "created",
  1: "picked by driver",
  2: "checked in",
  3: "in transit",
  // 4: "out for delivery", // looks like its never used
  5: "delivered",
  6: "return to hub",
  7: "cancelled"
};


// for the given client facing "size" (e.g. "medium"), return the corresponding
// internal representation (e.g. {type: 0, envelopeCount: 0, height: 9, width: 9, depth: 12})
exports.sizeToItemObj = (size) => {
  // this is how we model package size on the backend :(
  // envelope is type=0 and envelopeCount="1" with zero dimensions
  // everything else is type=1 and non-zero dimensions
  let itemObj = {Type: 1, EnvelopeCount: 0, Height: 0, Width: 0, Depth: 0};
  switch (size) {
    case ENVELOPE:
      return Object.assign(itemObj, {Type: 0, EnvelopeCount: "1"}); // yes, user portal uses a string
    case SMALL:
      return Object.assign(itemObj, {Height: 3, Width: 9, Depth: 9});
    case MEDIUM:
      return Object.assign(itemObj, {Height: 9, Width: 9, Depth: 12});
    case LARGE:
      return Object.assign(itemObj, {Height: 9, Width: 12, Depth: 18});
    case FULL:
      return Object.assign(itemObj, {Height: 12, Width: 18, Depth: 18});
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
