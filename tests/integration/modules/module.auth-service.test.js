import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as AuthService from "../../../src/api/modules/auth-service";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Auth service module Tests", function () {
  it("should successfully make a call to signup", async function () {
    const mockResponse = {
      status: true,
      data: {
        id: "000123",
        firstName: "John",
        lastName: "Doe",
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/create")
      .reply(200, mockResponse);

    const response = await AuthService.signup({});
    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });

  it("should successfully make a call to login", async function () {
    const mockResponse = {
      status: true,
      data: {
        userId: "jbfrgrgr",
        token: "sometokenfromjwt",
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(200, mockResponse);

    const response = await AuthService.login({});
    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });

  it("should successfully make a call to request password reset", async function () {
    const mockResponse = {
      status: true,
      data: { verificationId: "2427424" },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/password/reset-request")
      .reply(200, mockResponse);

    const response = await AuthService.resetPasswordRequest({});
    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });

  it("should successfully make a call to reset password", async function () {
    const mockResponse = {
      status: true,
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put("/password/reset-password-web")
      .reply(200, mockResponse);

    const response = await AuthService.resetPassword({});
    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });

  it("should successfully change owner's password", async function () {
    const mockResponse = {
      status: true,
      data: {
        userId: "001",
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put("/password/change")
      .reply(200, mockResponse);

    const response = await AuthService.changePassword({});
    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });
});
