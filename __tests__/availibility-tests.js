/* jshint node: true */
/* global describe, test, expect */
/* Run tests with jest */

"use strict";

let request = require("supertest");
let testUtils = require("./test-utils.js");
let app = require('../app.js');

describe("GET /pricing bad requests", () => {
  test("missing params", async () => {
    let res = await request(app).get(`/api/v1/service_availability`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual(testUtils.missingParamMsg("from_zip"));
    expect(res.body.errors).toContainEqual(testUtils.missingParamMsg("to_zip"));
  });
});

