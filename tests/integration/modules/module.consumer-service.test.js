import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as ConsumerService from "../../../src/api/modules/consumer-service";
import { OK } from "../../../src/api/modules/status";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Consumer service module Tests", function () {
  it("should successfully signup on consumer service", async function () {
    const mockResponse = {
      status: true,
      data: {
        id: "1",
        firstName: "John",
        lastName: "Doe",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/create/OUTLET_OWNER")
      .reply(OK, mockResponse);

    const response = await ConsumerService.signup({});
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully delete owner on consumer service", async function () {
    const mockResponse = {
      status: true,
      data: {
        userId: "1",
      },
    };

    const userId = "1";
    nock(process.env.CONSUMER_SERVICE_URL)
      .put(`/user/${userId}/recreate-web`)
      .reply(OK, mockResponse);

    const response = await ConsumerService.deleteUserAccount(userId);
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully get owner details", async function () {
    const mockResponse = {
      status: true,
      data: {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        store: [],
        goal: "ACTIVE",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get("/user/1/details")
      .reply(OK, mockResponse);

    const response = await ConsumerService.getUserDetails(1);
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully request for a verification email", async function () {
    const mockResponse = {
      status: true,
      data: {
        verificationId: "12345",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/email-verification")
      .reply(OK, mockResponse);

    const response = await ConsumerService.requestVerificationEmail({});
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully validate verification OTP", async function () {
    const mockResponse = {
      status: true,
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/email-validation")
      .reply(OK, mockResponse);

    const response = await ConsumerService.validateVerificationOtp({});
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully generate OTP", async function () {
    const mockResponse = {
      status: true,
      data: {
        verificationId: "723r7f3rg3r8h434",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL).post("/otp").reply(OK, mockResponse);

    const response = await ConsumerService.generateOtp({});
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully validate OTP", async function () {
    const mockResponse = {
      status: true,
    };

    const verificationId = "7f64gfn4";
    const otpCode = "783459";
    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/otp/${verificationId}/${otpCode}/validate`)
      .reply(200, mockResponse);

    const response = await ConsumerService.validateUserOtp({
      verificationId,
      otpCode,
    });
    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });
});
