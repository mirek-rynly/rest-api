/* jshint node: true */
/* global describe, test, expect */
/* Run tests with jest */

"use strict";

let request = require("supertest");
let utils = require("../utils.js");
let app = require('../app.js');

// Pricing

describe('GET /pricing valid requests', () => {
  twoParamTest(false, "envelope", 5);
  twoParamTest(false, "small", 5);
  twoParamTest(false, "medium", 5);
  twoParamTest(false, "large", 7);
  twoParamTest(false, "full", 10);

  twoParamTest(true, "envelope", 10);
  twoParamTest(true, "small", 10);
  twoParamTest(true, "medium", 10);
  twoParamTest(true, "large", 14);
  twoParamTest(true, "full", 20);

  test(`is_expedited='true', no size param'`, async () => {
    let res = await request(app).get(`/api/v1/pricing?is_expedited=false`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      pricing: [
        {size: "envelope", "is_expedited": false, price: 5, currency: "USD"},
        {size: "small", "is_expedited": false, price: 5, currency: "USD"},
        {size: "medium", "is_expedited": false, price: 5, currency: "USD"},
        {size: "large", "is_expedited": false, price: 7, currency: "USD"},
        {size: "full", "is_expedited": false, price: 10, currency: "USD"}
      ]
    });
  });

  test(`no is_expedited param, size='medium'`, async () => {
    let res = await request(app).get(`/api/v1/pricing?size=medium`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      pricing: [
        {size: "medium", "is_expedited": false, price: 5, currency: "USD"},
        {size: "medium", "is_expedited": true, price: 10, currency: "USD"},
      ]
    });
  });

  test(`no is_expedited param, no size param'`, async () => {
    let res = await request(app).get(`/api/v1/pricing`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      pricing: [
        {size: "envelope", "is_expedited": false, price: 5, currency: "USD"},
        {size: "small", "is_expedited": false, price: 5, currency: "USD"},
        {size: "medium", "is_expedited": false, price: 5, currency: "USD"},
        {size: "large", "is_expedited": false, price: 7, currency: "USD"},
        {size: "full", "is_expedited": false, price: 10, currency: "USD"},
        {size: "envelope", "is_expedited": true, price: 10, currency: "USD"},
        {size: "small", "is_expedited": true, price: 10, currency: "USD"},
        {size: "medium", "is_expedited": true, price: 10, currency: "USD"},
        {size: "large", "is_expedited": true, price: 14, currency: "USD"},
        {size: "full", "is_expedited": true, price: 20, currency: "USD"}
      ]
    });
  });

});

describe("GET /pricing bad requests", () => {
  test("bad param values", async () => {
    let res = await request(app).get(`/api/v1/pricing?is_expedited=X&size=Y`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual({
      location : "query",
      msg: "must be one of [true,false]",
      param: "is_expedited",
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

// HELPERS

function twoParamTest(isExpedited, size, price) {
  test(`is_expedited='${isExpedited}' size='${size}'`, async () => {
    let res = await request(app).get(`/api/v1/pricing?is_expedited=${isExpedited}&size=${size}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      pricing: [{size: size, "is_expedited": isExpedited, price: price, currency: "USD"}]
    });
  });
}
