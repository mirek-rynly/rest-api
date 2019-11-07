/* jshint node: true */
/* global describe, test, expect */
/* Run tests with jest */

"use strict";

let request = require("supertest");
let testUtils = require("./test-utils.js");
let app = require('../app.js');

const LOCAL_PARAMS = "source-zip=97202&destination-zip=97202";
const LONG_DISTANCE_PARAMS = "source-zip=97202&destination-zip=98001";

describe("GET /delivery-date with no order-creation-timestamp given", () => {
  test("non-expedited local package created now", async () => {
    let url = getUrl(LOCAL_PARAMS, false, null);
    let res = await request(app).get(url);

    expect(res.statusCode).toEqual(200);
    // e.g. "expedited local delivery for order placed right now (2019-10-28T06:00:00Z Pacific)"
    let msgRegex = /expedited local delivery for order placed on \([0-9]{4}-[0-9]{2}-[0-9]{2} Pacific\)/;
    expect(res.body.msg).toMatch(msgRegex);
    expect(res.body["due-date"]).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/); // YYYY-MM-DD
  });

});

describe("GET /delivery-date for local packages", () => {
  test("non-expedited local delivery created on monday", async () => {
    let timestamp = "2019-10-28T06:00:00Z";
    let url = getUrl(LOCAL_PARAMS, false, timestamp);
    let expectedMsg = "non-expedited local delivery for order placed at 2019-10-28T06:00:00Z";
    let expectedDate = "2019-10-31";
    timestampTest(url, expectedMsg, expectedDate);
  });

  test("expedited local delivery created monday morning before 11AM", async () => {
    let timestamp = "2019-10-28T06:00:00Z";
    let url = getUrl(LOCAL_PARAMS, true, timestamp);
    let expectedMsg = "expedited local delivery for order placed at 2019-10-28T06:00:00Z";
    let expectedDate = "2019-10-28";
    timestampTest(url, expectedMsg, expectedDate);
  });

  test("expedited local delivery created monday morning after 11AM", async () => {
    let timestamp = "2019-10-28T13:00:00Z";
    let url = getUrl(LOCAL_PARAMS, true, timestamp);
    let expectedMsg = "expedited local delivery for order placed at 2019-10-28T13:00:00Z";
    let expectedDate = "2019-10-29";
    timestampTest(url, expectedMsg, expectedDate);
  });
});

describe("GET /delivery-date for long-distance packages", () => {
  test("non-expedited long-distance delivery created on monday", async () => {
    let timestamp = "2019-10-28T06:00:00Z";
    let url = getUrl(LOCAL_PARAMS, true, timestamp);
    let expectedMsg = "non-expedited long-distance delivery for order placed at 2019-10-28T06:00:00Z";
    let expectedDate = "2019-10-30";
    timestampTest(url, expectedMsg, expectedDate);
  });

  test("expedited long-distance delivery created monday morning before 11AM", async () => {
    let timestamp = "2019-10-28T06:00:00Z";
    let url = getUrl(LOCAL_PARAMS, true, timestamp);
    let expectedMsg = "expedited local delivery for order placed at 2019-10-28T06:00:00Z";
    let expectedDate = "2019-10-29";
    timestampTest(url, expectedMsg, expectedDate);
  });

  test("expedited long-distance delivery created monday morning after 11AM", async () => {
    let timestamp = "2019-10-28T13:00:00Z";
    let url = getUrl(LOCAL_PARAMS, true, timestamp);
    let expectedMsg = "expedited local delivery for order placed at 2019-10-28T13:00:00Z";
    let expectedDate = "2019-10-29";
    timestampTest(url, expectedMsg, expectedDate);
  });
});

describe("GET /delivery-date param validation", () => {
  test("no params", async () => {
    let res = await request(app).get(`/api/v1/delivery-date`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual(testUtils.missingParamMsg("source-zip"));
    expect(res.body.errors).toContainEqual(testUtils.missingParamMsg("destination-zip"));
    expect(res.body.errors).toContainEqual(testUtils.missingParamMsg("isExpedited"));
  });
});

// HELPERS
async function timestampTest(url, expectedMsg, expectedDate) {
  let res = await request(app).get(url);
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual({
    msg: expectedMsg,
    "due-date": expectedDate
  });
}


// UTILS

function getUrl(distanceParams, isExpedited, timestamp) {
  let url = `/api/v1/delivery-date?${distanceParams}&is-expedited=${isExpedited}`;
  if (timestamp) {
    url += `&order-creation-timestamp=${timestamp}`;
  }
  return url;
}
