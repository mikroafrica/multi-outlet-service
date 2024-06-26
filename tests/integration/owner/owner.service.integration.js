import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import * as OwnerService from "../../../src/api/resources/owner/owner.service";
import * as AuthService from "../../../src/api/resources/auth/auth.service";
import { Owner } from "../../../src/api/resources/owner/owner.model";
import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  OK,
  NOT_FOUND,
  UN_AUTHORISED,
  NOT_FOUND,
} from "../../../src/api/modules/status";
import { TempOwner } from "../../../src/api/resources/owner/temp.owner.model";
import { Outlet } from "../../../src/api/resources/outlet/outlet.model";
import { OutletStatus } from "../../../src/api/resources/outlet/outlet.status";
import * as ConsumerService from "../../../src/api/modules/consumer-service";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Owner service Tests", function () {
  const signupParams = {
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@mikro.africa",
    phoneNumber: "08023548653",
    password: "P@ssword123",
    gender: "MALE",
    profileImageId: "https://url-to-visit.png",
    noOfOutlets: "5-10",
    userType: "OUTLET_OWNER",
  };

  const loginParams = {
    email: "johndoe@mikro.africa",
    password: "password",
  };

  const validateEmailParams = {
    verificationId: "hvftyehfbevgfe",
    otpCode: "440410",
  };

  const resetPasswordParams = {
    token: "someverylongandrandomtoken",
    password: "newpassword",
  };

  const changePasswordParams = {
    currentPassword: "oldpassword",
    newPassword: "newpassword",
  };

  it("should successfully sign up a multi-outlet owner", async function () {
    const mockResponse = {
      data: {
        id: "123",
      },
    };

    const userType = signupParams.userType;
    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/create/${userType}`)
      .reply(OK, mockResponse);

    nock(process.env.AUTH_SERVICE_URL).post("/auth/create").reply(OK, {});

    sinon.stub(TempOwner.prototype, "save").resolves({
      userId: "user-id",
      phoneNumber: "09024764875",
      noOfOutlets: "5-10",
      userType: "PARTNER",
    });

    const response = await AuthService.signupMultiOutletOwner(signupParams);

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to create an owner if consumer service returns an error", async function () {
    const mockResponse = {
      message: "User account exists",
    };

    const userType = signupParams.userType;
    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/create/${userType}`)
      .reply(BAD_REQUEST, mockResponse);

    try {
      await AuthService.signupMultiOutletOwner(signupParams);
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should fail to create an owner if auth service returns an error", async function () {
    const mockResponse = {
      data: {
        id: "123",
      },
    };

    const userType = signupParams.userType;
    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/create/${userType}`)
      .reply(OK, mockResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .put(`/user/${mockResponse.data.id}/recreate-web`)
      .reply(OK, mockResponse);

    nock(process.env.AUTH_SERVICE_URL).post("/auth/create").reply(BAD_REQUEST, {
      statusCode: BAD_REQUEST,
      message: "An error occurred while trying to save owner",
    });

    try {
      await AuthService.signupMultiOutletOwner(signupParams);
    } catch (err) {
      expect(err.statusCode).equals(CONFLICT);
      expect(err.message).to.exist;
    }
  });

  it("should successfully login an owner", async function () {
    const loginMockResponse = {
      data: {
        userId: "1234",
      },
    };

    const userDetailsMockResponse = {
      data: {
        userId: "007",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@mikro.africa",
        store: [
          {
            wallet: [
              {
                id: "048p-353",
                currency: "NGN",
                balance: 129.2,
              },
            ],
          },
        ],
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(OK, loginMockResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${loginMockResponse.data.userId}/details`)
      .reply(OK, userDetailsMockResponse);

    const findOneOwner = sinon
      .stub(Owner, "findOne")
      .resolves({ userId: "id", walletId: "74hr-nj3b4" });

    const response = await AuthService.loginMultiOutletOwner({
      params: loginParams,
    });

    expect(response.statusCode).equals(OK);
    expect(response.data).exist;

    findOneOwner.restore();
    sinon.assert.calledOnce(findOneOwner);
  });

  it("should fail to login an owner when owner details are wrong", async function () {
    const failedLoginMockResponse = {
      statusCode: UN_AUTHORISED,
      message: "Invalid credentials",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(UN_AUTHORISED, failedLoginMockResponse);

    try {
      await AuthService.loginMultiOutletOwner({ params: loginParams });
    } catch (err) {
      expect(err.statusCode).equals(UN_AUTHORISED);
      expect(err.message).to.exist;
    }
  });

  it("should fail to login an owner when owner doesn't have a valid wallet", async function () {
    const loginMockResponse = {
      data: {
        userId: "123",
      },
    };

    const userDetailsMockResponse = {
      data: {
        userId: "007",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@mikro.africa",
        store: [
          {
            wallet: [],
          },
        ],
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(OK, loginMockResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${loginMockResponse.data.userId}/details`)
      .reply(OK, userDetailsMockResponse);

    const findOneOwner = sinon.stub(Owner, "findOne").resolves(null);

    try {
      await AuthService.loginMultiOutletOwner({
        params: loginParams,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).exist;
    }

    findOneOwner.restore();
    sinon.assert.calledOnce(findOneOwner);
  });

  it("should fail to login an owner when owner has not activated their account", async function () {
    const loginMockResponse = {
      data: {
        userId: "007",
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(OK, loginMockResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${loginMockResponse.data.userId}/details`)
      .reply(FORBIDDEN, {
        statusCode: FORBIDDEN,
        message: "User account is not active yet",
      });

    try {
      await AuthService.loginMultiOutletOwner({ params: loginParams });
    } catch (err) {
      expect(err.statusCode).equals(FORBIDDEN);
      expect(err.message).to.exist;
    }
  });

  it("should successfully send a verification email", async function () {
    const sendVerificationMockResponse = {
      data: {
        userId: "007",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-verification`)
      .reply(OK, sendVerificationMockResponse);

    const response = await AuthService.sendVerificationEmail("007");
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to send a verification email if userId is undefined", async function () {
    try {
      await AuthService.sendVerificationEmail();
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should fail to send a verification email if an error occurs at consumer service", async function () {
    const mockErrorResponse = {
      statusCode: BAD_REQUEST,
      message: "Could not send Verification email",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-verification`)
      .reply(BAD_REQUEST, mockErrorResponse);

    try {
      await AuthService.sendVerificationEmail("007");
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should successfully validate an email", async function () {
    const mockResponse = {
      data: {},
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-validation`)
      .reply(OK, mockResponse);

    const response = await AuthService.validateEmail(validateEmailParams);
    expect(response.statusCode).equals(OK);
  });

  it("should fail to validate email if consumer service throws an error", async function () {
    const mockErrorResponse = {
      message: "Email has been verified previously",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-validation`)
      .reply(BAD_REQUEST, mockErrorResponse);

    try {
      await AuthService.validateEmail(validateEmailParams);
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should successfully request a password reset", async function () {
    const mockResponse = {
      data: {},
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post(`/password/reset-request`)
      .reply(OK, mockResponse);

    const response = await AuthService.requestResetPassword({
      params: { email: "johndoe@mikro.africa" },
    });
    expect(response.statusCode).equals(OK);
  });

  it("should fail to request a password reset if an error occurs in auth service", async function () {
    const mockResponse = {
      message: "An error occurred while requesting a password reset",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post(`/password/reset-request`)
      .reply(BAD_REQUEST, mockResponse);
    try {
      await AuthService.requestResetPassword({
        email: "johndoe@mikro.africa",
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should successfully reset a owner's password", async function () {
    const mockResponse = {
      data: {},
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/reset-password-web`)
      .reply(OK, mockResponse);

    const response = await AuthService.resetPassword({
      params: resetPasswordParams,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail reset password if an error occurs in auth service", async function () {
    const mockErrorResponse = {
      message: "Token supplied is invalid",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/reset-password-web`)
      .reply(BAD_REQUEST, mockErrorResponse);

    try {
      await AuthService.resetPassword({
        params: resetPasswordParams,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should successfully change a owner's password", async function () {
    const mockResponse = {
      data: {
        data: {
          userId: changePasswordParams.userId,
        },
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/change`)
      .reply(OK, mockResponse);

    const response = await AuthService.changePassword({
      params: changePasswordParams,
      ownerId: "some-uuid-pass-word",
    });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to change a owner's password if an error occurs in auth service", async function () {
    const mockErrorResponse = {
      message: "Password supplied is wrong",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/change`)
      .reply(BAD_REQUEST, mockErrorResponse);

    try {
      await AuthService.changePassword({
        params: changePasswordParams,
        ownerId: "123",
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should successfully update a owner", async function () {
    const userId = "123";
    const params = {
      firstName: "John",
      lastName: "Doe",
    };

    const mockUserDetailsResponse = {
      data: {
        userId,
        firstName: "Joe",
        lastName: "Doe",
      },
    };

    const mockUpdateProfileResponse = {
      data: {
        userId,
        firstName: "John",
        lastName: "Doe",
        gender: "MALE",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${userId}/details`)
      .reply(OK, mockUserDetailsResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .put(`/user/${userId}/profile`)
      .reply(OK, mockUpdateProfileResponse);

    const findOneOwner = sinon
      .stub(Owner, "findOne")
      .resolves({ userId: "id", walletId: "74hr-nj3b4" });

    const response = await OwnerService.updateUser({
      params,
      ownerId: userId,
    });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    findOneOwner.restore();
    sinon.assert.calledOnce(findOneOwner);
  });

  it("should fail to update a owner if owner details cannot be found", async function () {
    const userId = "12345";
    const params = {
      firstName: "John",
      lastName: "Doe",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${userId}/details`)
      .reply(BAD_REQUEST, {
        statusCode: BAD_REQUEST,
        message: "Could not find owner details",
      });

    try {
      await OwnerService.updateUser({
        params,
        ownerId: userId,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should fail to update a owner if consumer service fails to update a owner", async function () {
    const userId = "123";
    const params = {
      firstName: "John",
      lastName: "Doe",
    };

    const mockUserDetailsResponse = {
      data: {
        userId,
        firstName: "Joe",
        lastName: "Doe",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${userId}/details`)
      .reply(OK, mockUserDetailsResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .put(`/user/${userId}/profile`)
      .reply(BAD_REQUEST, {
        statusCode: BAD_REQUEST,
        message: "Failed to update a owner",
      });

    try {
      await OwnerService.updateUser({
        params,
        ownerId: userId,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should successfully get an owner details", async function () {
    const userId = "123";

    const mockUserDetailsResponse = {
      data: {
        userId,
        firstName: "Joe",
        lastName: "Doe",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${userId}/details`)
      .reply(OK, mockUserDetailsResponse);

    const response = await OwnerService.getUser({
      ownerId: userId,
    });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to get an owner details if an error occurs in consumer service", async function () {
    const userId = "123";

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${userId}/details`)
      .reply(BAD_REQUEST, {
        statusCode: BAD_REQUEST,
        message: "Could not find owner details",
      });

    try {
      await OwnerService.getUser({
        ownerId: userId,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should fetch users when a valid usertype is supplied", async function () {
    const userType = "OUTLET_OWNER";
    const userId = "bhgykhcb1uy";
    const filter = { userType };
    const page = 1;
    const limit = 2;

    const mockQueryResponse = {
      data: {
        hits: {
          total: { value: 1, relation: "eq" },
          max_score: null,
          hits: [
            {
              _index: "mikro-user",
              _score: null,
              _source: {
                userId: "bhgykhcb1uy",
                firstName: "user",
              },
            },
          ],
        },
      },
    };

    const should = [{ match: { userId: "78yiu1gb1hduy" } }];

    const findOwners = sinon.stub(Owner, "paginate").resolves({
      filter,
      page,
      limit,
      docs: [
        {
          userType: "OUTLET_OWNER",
          userId: "ufdgvu3y",
          commissionStatus: "none",
        },
      ],
    });

    nock(process.env.REPORT_SERVICE_URL)
      .post("/report/raw")
      .reply(OK, mockQueryResponse);

    const response = await OwnerService.getUsers({ userType, page, limit });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    findOwners.restore();
    sinon.assert.calledOnce(findOwners);
  });

  it("should fail to fetch users if owner does not exist.", async function () {
    const userType = "OUTLET_OWNER";
    const userId = "bhgykhcb1uy";
    const filter = { userType };
    const page = 1;
    const limit = 2;

    const mockQueryResponse = {
      data: {
        hits: {
          total: { value: 1, relation: "eq" },
          max_score: null,
          hits: [
            {
              _index: "mikro-user",
              _score: null,
              _source: {
                userId: "bhgykhcb1uy",
                firstName: "user",
              },
            },
          ],
        },
      },
    };

    const should = [{ match: { userId: "78yiu1gb1hduy" } }];

    const findOwners = sinon.stub(Owner, "paginate").resolves(null);

    nock(process.env.REPORT_SERVICE_URL)
      .post("/report/raw")
      .reply(OK, mockQueryResponse);

    try {
      await OwnerService.getUsers({ userType, page, limit });
    } catch (err) {
      expect(err.statusCode).equals(NOT_FOUND);
      expect(err.message).to.exist;
    }

    findOwners.restore();
    sinon.assert.calledOnce(findOwners);
  });
});
