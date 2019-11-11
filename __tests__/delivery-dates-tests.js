/* jshint node: true */
/* global describe, test, expect */
/* Run tests with jest */

"use strict";

let request = require("supertest");
let testUtils = require("./test-utils.js");
let app = require('../app.js');

const LOCAL_PARAMS = "from-zip=97202&to-zip=97202";
const LONG_DISTANCE_PARAMS = "from-zip=97202&to-zip=98001";

describe("GET /delivery-date with no order-creation-timestamp given", () => {
  test("non-expedited local package created now", async () => {
    let url = getUrl(LOCAL_PARAMS, false, null);
    let res = await request(app).get(url);

    expect(res.statusCode).toEqual(200);
    // e.g. "expedited local delivery for order placed right now (2019-10-28T06:00:00 Pacific)"
    let msgRegex = /end of day due date for order placed now \([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9:.]+ Pacific\)/;
    expect(res.body.msg).toMatch(msgRegex);
    expect(res.body["due-date"]).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/); // YYYY-MM-DD
  });

});

describe("GET /delivery-date for local packages", () => {
  test("non-expedited package created on 10/28/19 monday", async () => {
    let timestamp = "2019-10-28T14:00:00Z"; // 2PM UTC = 6AM Pacific
    let url = getUrl(LOCAL_PARAMS, false, timestamp);
    let expectedDate = "2019-10-31";
    await timestampTest(url, expectedDate);
  });

  test("expedited package created 10/28/19 monday morning before 11AM", async () => {
    let timestamp = "2019-10-28T14:00:00Z";
    let url = getUrl(LOCAL_PARAMS, true, timestamp);
    let expectedDate = "2019-10-28";
    await timestampTest(url, expectedDate);
  });

  test("expedited package created 10/28/19 monday morning after 11AM", async () => {
    let timestamp = "2019-10-28T21:00:00Z";
    let url = getUrl(LOCAL_PARAMS, true, timestamp);
    let expectedDate = "2019-10-29";
    await timestampTest(url, expectedDate);
  });
});

describe("GET /delivery-date for long-distance packages", () => {
  test("non-expedited package created 10/28/19 on monday", async () => {
    let timestamp = "2019-10-28T14:00:00Z";
    let url = getUrl(LONG_DISTANCE_PARAMS, false, timestamp);
    let expectedDate = "2019-10-31";
    await timestampTest(url, expectedDate);
  });

  test("expedited package created 10/28/19 monday morning before 11AM", async () => {
    let timestamp = "2019-10-28T14:00:00Z";
    let url = getUrl(LONG_DISTANCE_PARAMS, true, timestamp);
    let expectedDate = "2019-10-29";
    await timestampTest(url, expectedDate);
  });

  test("expedited package created 10/28/19 monday morning after 11AM", async () => {
    let timestamp = "2019-10-28T21:00:00Z";
    let url = getUrl(LONG_DISTANCE_PARAMS, true, timestamp);
    let expectedDate = "2019-10-29";
    await timestampTest(url, expectedDate);
  });
});

describe("GET /delivery-date param validation", () => {
  test("no params", async () => {
    let res = await request(app).get(`/api/v1/delivery-date`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual(testUtils.missingParamMsg("from-zip"));
    expect(res.body.errors).toContainEqual(testUtils.missingParamMsg("to-zip"));
    expect(res.body.errors).toContainEqual(testUtils.missingParamMsg("is-expedited"));
  });
});

describe("GET /delivery-date timezone conversion", () => {
  test("7AM UTC handled in pacific time of the previous day", async () => {
    let timestamp = "2019-10-29T04:00:00Z"; // Tuesday morning UTC = Monday evening Pacific
    let url = getUrl(LOCAL_PARAMS, false, timestamp);
    let expectedDate = "2019-10-31";
    await timestampTest(url, expectedDate);
  });
});

// HELPERS

async function timestampTest(url, expectedDate) {
  let res = await request(app).get(url);
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual({
    msg: expect.any(String),
    "due-date": expectedDate
  });
}


// UTILS

function getUrl(distanceParams, isExpedited, timestamp) {
  let url = `/api/v1/delivery-date?${distanceParams}&is-expedited=${isExpedited}`;
  if (timestamp) {
    url += `&order-creation-datetime=${timestamp}`;
  }
  return url;
}
