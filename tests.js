/* jshint node: true */
"use strict";

let assert = require("assert");
let utils = require("./utils.js");

// TODO: setup mocha. For now just run the file as a script using node

// UTILS TESTS

// roundtrip for all types
for (let size of utils.PACKAGE_SIZES) {
  console.log("Testing converion for " + size);
  let itemObj = utils.sizeToItemObj(size);
  let backToSize = utils.itemObjToSize(itemObj);
  assert(backToSize === size);
}

// make the roundtrip is actually doing stuff
let mediumItemObj = {Type: 1, EnvelopeCount: 0, Height: 9, Width: 9, Depth: 12};
assert(utils.itemObjToSize(mediumItemObj) === "medium");
