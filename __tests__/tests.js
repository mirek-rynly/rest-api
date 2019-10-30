/* jshint node: true */
/* global describe, test, expect */

"use strict";

let assert = require("assert");
let utils = require("../utils.js");

let request = require('supertest');
let app = require('../app.js');

// UTILS TESTS
describe('utils: size to object conversion', () => {
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


// API tests

describe('GET /pricing endpoint legit requests', () => {
  legitGetPricingTest(false, "envelope", 5);
  legitGetPricingTest(false, "small", 5);
  legitGetPricingTest(false, "medium", 5);
  legitGetPricingTest(false, "large", 7);
  legitGetPricingTest(false, "full", 10);

  legitGetPricingTest(true, "envelope", 10);
  legitGetPricingTest(true, "small", 10);
  legitGetPricingTest(true, "medium", 10);
  legitGetPricingTest(true, "large", 14);
  legitGetPricingTest(true, "full", 20);
});

function legitGetPricingTest(isExpedited, size, price) {
  test(`expedited='${isExpedited}' size='${size}'`, async () => {
    let res = await request(app).get(`/api/v1/pricing?is-expedited=${isExpedited}&size=${size}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({price: price, currency: "USD"});
  });
}

describe("GET /pricing endpoint bad requests", () => {
  test("missing params", async () => {
    let res = await request(app).get(`/api/v1/pricing`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual(missingParamMsg("is-expedited"));
    expect(res.body.errors).toContainEqual(missingParamMsg("size"));
  });

  test("bad param values", async () => {
    let res = await request(app).get(`/api/v1/pricing?is-expedited=X&size=Y`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual({
      location : "query",
      msg: "must be one of [true,false]",
      param: "is-expedited",
      value: "X"
    });
    expect(res.body.errors).toContainEqual({
      location : "query",
      msg: "must be one of [envelope,small,medium,large,full]",
      param: "size",
      value: "Y"
    });
  });

});


// UTILS
function missingParamMsg(paramName, expectedValue) {
  return {location : "query", msg: "required param missing", param: paramName};
}
