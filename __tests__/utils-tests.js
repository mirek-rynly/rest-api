/* jshint node: true */
/* global describe, test, expect */
/* Run tests with jest */

"use strict";

let request = require("supertest");
let utils = require("../utils.js");

describe('size to object conversion', () => {
  test('rountrip conversion for all sizes', () => {
    for (let size of utils.PACKAGE_SIZES) {
      console.log("Testing converion for " + size);
      let itemObj = utils.sizeToItemObj(size);
      let backToSize = utils.itemObjToSize(itemObj);
      expect(backToSize).toBe(size);
    }
  });

  // make the roundtrip is actually doing stuff
  test('size to item conversion', () => {
    let mediumItemObj = {Type: 1, EnvelopeCount: 0, Height: 9, Width: 9, Depth: 12};
    expect(utils.itemObjToSize(mediumItemObj)).toBe("medium");
  });
});
