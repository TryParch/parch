"use strict";

import path from "path";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import supertest from "supertest";

chai.use(sinonChai);

import Application from "../src/application";
import Router from "../src/router";

describe("Application", function () {
  let application;

  describe("#map", function () {
    beforeEach(function () {
      application = new Application({
        controllers: {
          dir: path.resolve(__dirname, "fixtures", "controllers")
        }
      });
    });

    it("gets called with a Router instance", function () {
      application.map(function () {
        expect(this).to.be.an.instanceof(Router);
      });
    });

    it("maps routes to their controller", function (done) {
      application.map(function () {
        this.resource("foo");
      });

      supertest(application.getApp())
        .get("/foos")
        .expect(200)
        .end(done);
    });
  });

  describe("#start", function () {
    let mockRestify = {
      acceptable: ["application/json"],
      createServer() {},
      listen(port, cb) { cb(); },
      use() {}
    };

    beforeEach(function () {
      sinon.spy(mockRestify, "listen");
      application = new Application({
        app: mockRestify,
        controllers: {
          dir: path.resolve(__dirname, "fixtures", "controllers")
        }
      });
    });

    afterEach(function () {
      mockRestify.listen.restore();
    });

    it("starts the application", function () {
      return application.start().then(() => {
        expect(mockRestify.listen).to.have.been.calledWith(3000);
      });
    });
  });
});
