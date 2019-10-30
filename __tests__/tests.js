/* jshint node: true */
/* global describe, test, expect */
/* Run tests with jest */

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


// API TESTS

// Pricing

describe('GET /pricing endpoint legit requests', () => {
  legitGetTwoParamPricingTest(false, "envelope", 5);
  legitGetTwoParamPricingTest(false, "small", 5);
  legitGetTwoParamPricingTest(false, "medium", 5);
  legitGetTwoParamPricingTest(false, "large", 7);
  legitGetTwoParamPricingTest(false, "full", 10);

  legitGetTwoParamPricingTest(true, "envelope", 10);
  legitGetTwoParamPricingTest(true, "small", 10);
  legitGetTwoParamPricingTest(true, "medium", 10);
  legitGetTwoParamPricingTest(true, "large", 14);
  legitGetTwoParamPricingTest(true, "full", 20);

  test(`expedited='true', no size param'`, async () => {
    let res = await request(app).get(`/api/v1/pricing?is-expedited=false`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      pricing: [
        {size: "envelope", "is-expedited": false, price: 5, currency: "USD"},
        {size: "small", "is-expedited": false, price: 5, currency: "USD"},
        {size: "medium", "is-expedited": false, price: 5, currency: "USD"},
        {size: "large", "is-expedited": false, price: 7, currency: "USD"},
        {size: "full", "is-expedited": false, price: 10, currency: "USD"}
      ]
    });
  });

  test(`size='medium', no expedited param'`, async () => {
    let res = await request(app).get(`/api/v1/pricing?size=medium`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      pricing: [
        {size: "medium", "is-expedited": false, price: 5, currency: "USD"},
        {size: "medium", "is-expedited": true, price: 10, currency: "USD"},
      ]
    });
  });

  test(`no size param, no expedited param'`, async () => {
    let res = await request(app).get(`/api/v1/pricing`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      pricing: [
        {size: "envelope", "is-expedited": false, price: 5, currency: "USD"},
        {size: "small", "is-expedited": false, price: 5, currency: "USD"},
        {size: "medium", "is-expedited": false, price: 5, currency: "USD"},
        {size: "large", "is-expedited": false, price: 7, currency: "USD"},
        {size: "full", "is-expedited": false, price: 10, currency: "USD"},
        {size: "envelope", "is-expedited": true, price: 10, currency: "USD"},
        {size: "small", "is-expedited": true, price: 10, currency: "USD"},
        {size: "medium", "is-expedited": true, price: 10, currency: "USD"},
        {size: "large", "is-expedited": true, price: 14, currency: "USD"},
        {size: "full", "is-expedited": true, price: 20, currency: "USD"}
      ]
    });
  });

});

function legitGetTwoParamPricingTest(isExpedited, size, price) {
  test(`expedited='${isExpedited}' size='${size}'`, async () => {
    let res = await request(app).get(`/api/v1/pricing?is-expedited=${isExpedited}&size=${size}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      pricing: [{size: size, "is-expedited": isExpedited, price: price, currency: "USD"}]
    });
  });
}

describe("GET /pricing endpoint bad requests", () => {
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


// Service availability

describe("GET /pricing endpoint bad requests", () => {
  test("missing params", async () => {
    let res = await request(app).get(`/api/v1/service-availability`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual(missingParamMsg("source"));
    expect(res.body.errors).toContainEqual(missingParamMsg("destination"));
  });
});


// TEST UTILS
function missingParamMsg(paramName, expectedValue) {
  return {location : "query", msg: "required param missing", param: paramName, value: null};
}
