import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import * as OwnerService from "../../../src/api/resources/owner/owner.service";
import { Owner } from "../../../src/api/resources/owner/owner.model";
import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  OK,
  UN_AUTHORISED,
} from "../../../src/api/modules/status";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Owner service Tests", function () {
  const signupParams = {
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@mikro.africa",
    phoneNumber: "08023548653",
    password: "P@ssword123",
    businessName: "Active Business",
    address: "12 Awolowo drive",
    gender: "MALE",
    state: "Lagos",
    lga: "Ikeja",
    profileImageId: "https://url-to-visit.png",
    dob: "10-09-1990",
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

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/create/OUTLET_OWNER")
      .reply(OK, mockResponse);

    nock(process.env.AUTH_SERVICE_URL).post("/auth/create").reply(OK, {});

    const response = await OwnerService.signupMultiOutletOwner(signupParams);

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to create an owner if consumer service returns an error", async function () {
    const mockResponse = {
      message: "User account exists",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/create/OUTLET_OWNER")
      .reply(BAD_REQUEST, mockResponse);

    try {
      await OwnerService.signupMultiOutletOwner(signupParams);
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).exist;
    }
  });

  it("should fail to create an owner if auth service returns an error", async function () {
    const mockResponse = {
      data: {
        id: "123",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/create/OUTLET_OWNER")
      .reply(OK, mockResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .put(`/user/${mockResponse.data.id}/recreate-web`)
      .reply(OK, mockResponse);

    nock(process.env.AUTH_SERVICE_URL).post("/auth/create").reply(BAD_REQUEST, {
      statusCode: BAD_REQUEST,
      message: "An error occurred while trying to save owner",
    });

    try {
      await OwnerService.signupMultiOutletOwner(signupParams);
    } catch (err) {
      expect(err.statusCode).equals(CONFLICT);
      expect(err.message).exist;
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

    const response = await OwnerService.loginMultiOutletOwner({
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
      await OwnerService.loginMultiOutletOwner({ params: loginParams });
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
      await OwnerService.loginMultiOutletOwner({
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
      await OwnerService.loginMultiOutletOwner({ params: loginParams });
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

    const response = await OwnerService.sendVerificationEmail("007");
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to send a verification email if userId is undefined", async function () {
    try {
      await OwnerService.sendVerificationEmail();
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
      await OwnerService.sendVerificationEmail("007");
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

    const response = await OwnerService.validateEmail(validateEmailParams);
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
      await OwnerService.validateEmail(validateEmailParams);
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

    const response = await OwnerService.requestResetPassword({
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
      await OwnerService.requestResetPassword({
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

    const response = await OwnerService.resetPassword({
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
      await OwnerService.resetPassword({
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

    const response = await OwnerService.changePassword({
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
      await OwnerService.changePassword({
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
      businessName: "Good Stores",
      address: "12 Salami Street",
    };

    const mockUserDetailsResponse = {
      data: {
        userId,
        firstName: "Joe",
        lastName: "Doe",
        businessName: "Great Stores",
      },
    };

    const mockUpdateProfileResponse = {
      data: {
        userId,
        firstName: "John",
        lastName: "Doe",
        businessName: "Good Stores",
        gender: "MALE",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${userId}/details`)
      .reply(OK, mockUserDetailsResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .put(`/user/${userId}/profile`)
      .reply(OK, mockUpdateProfileResponse);

    const response = await OwnerService.updateUser({
      params,
      ownerId: userId,
    });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to update a owner if owner details cannot be found", async function () {
    const userId = "12345";
    const params = {
      firstName: "John",
      lastName: "Doe",
      businessName: "Good Stores",
      address: "12 Salami Street",
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
      businessName: "Good Stores",
      address: "12 Salami Street",
    };

    const mockUserDetailsResponse = {
      data: {
        userId,
        firstName: "Joe",
        lastName: "Doe",
        businessName: "Great Stores",
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
        businessName: "Great Stores",
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
});