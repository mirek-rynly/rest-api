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

describe("GET /pricing bad requests", () => {
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

// HELPERS

function twoParamTest(isExpedited, size, price) {
  test(`expedited='${isExpedited}' size='${size}'`, async () => {
    let res = await request(app).get(`/api/v1/pricing?is-expedited=${isExpedited}&size=${size}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      pricing: [{size: size, "is-expedited": isExpedited, price: price, currency: "USD"}]
    });
  });
}
