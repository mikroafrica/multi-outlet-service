import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as UserService from "../../../src/api/resources/user/user.service";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("User service Tests", function () {
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

  it("should successfully sign up a multi-outlet user", async function () {
    const mockResponse = {
      data: {
        id: "123",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/create/OUTLET_OWNER")
      .reply(200, mockResponse);

    nock(process.env.AUTH_SERVICE_URL).post("/auth/create").reply(200, {});

    const response = await UserService.signupMultiOutletOwner(signupParams);
    console.log(response);

    // expect(response.statusCode).to.be.number;
  });

  it("should fail to create a user if consumer service returns an error", async function () {
    const mockResponse = {
      message: "User account exists",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/create/OUTLET_OWNER")
      .reply(400, mockResponse);

    UserService.signupMultiOutletOwner(signupParams)
      .then((res) => console.log(res))
      .catch((err) => {
        console.log(err);
      });
  });

  it("should fail to create a user if auth service returns an error", async function () {
    const mockResponse = {
      data: {
        id: "123",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/create/OUTLET_OWNER")
      .reply(200, mockResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .put(`/user/${mockResponse.data.id}/recreate-web`)
      .reply(200, mockResponse);

    nock(process.env.AUTH_SERVICE_URL).post("/auth/create").reply(400, {
      statusCode: 400,
      message: "An error occurred while trying to save user",
    });

    UserService.signupMultiOutletOwner(signupParams)
      .then((res) => console.log(res))
      .catch((err) => {
        console.log(err);
      });
  });

  it("should successfully login a user", async function () {
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
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(200, loginMockResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${loginMockResponse.data.userId}/details`)
      .reply(200, userDetailsMockResponse);

    const response = await UserService.loginMultiOutletOwner({
      params: loginParams,
    });
    console.log(response);
  });

  it("should fail to login a user when user details are wrong", async function () {
    const failedLoginMockResponse = {
      statusCode: 401,
      message: "Invalid credentials",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(401, failedLoginMockResponse);

    UserService.loginMultiOutletOwner({ params: loginParams })
      .then()
      .catch((err) => console.log(err));
  });

  it("should fail to login a user when user has not activated their account", async function () {
    const loginMockResponse = {
      data: {
        userId: "007",
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(200, loginMockResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${loginMockResponse.data.userId}/details`)
      .reply(403, {
        statusCode: 403,
        message: "User account is not active yet",
      });

    UserService.loginMultiOutletOwner({ params: loginParams })
      .then()
      .catch((err) => console.log(err));
  });

  it("should successfully send a verification email", async function () {
    const sendVerificationMockResponse = {
      data: {
        userId: "007",
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-verification`)
      .reply(200, sendVerificationMockResponse);

    const response = await UserService.sendVerificationEmail("007");
    console.log(response);
  });

  it("should fail to send a verification email if userId is undefined", async function () {
    UserService.sendVerificationEmail()
      .then()
      .catch((err) => console.log(err));
  });

  it("should fail to send a verification email if an error occurs at consumer service", async function () {
    const mockErrorResponse = {
      statusCode: 400,
      message: "Could not send Verification email",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-verification`)
      .reply(400, mockErrorResponse);

    UserService.sendVerificationEmail("007")
      .then()
      .catch((err) => console.log(err));
  });

  it("should successfully validate an email", async function () {
    const mockResponse = {
      data: {},
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-validation`)
      .reply(200, mockResponse);

    const response = await UserService.validateEmail(validateEmailParams);
    console.log(response);
  });

  it("should fail to validate email if consumer service throws an error", async function () {
    const mockErrorResponse = {
      message: "Email has been verified previously",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-validation`)
      .reply(400, mockErrorResponse);

    UserService.validateEmail(validateEmailParams)
      .then()
      .catch((err) => console.log(err));
  });

  it("should successfully request a password reset", async function () {
    const mockResponse = {
      data: {},
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post(`/password/reset-request`)
      .reply(200, mockResponse);

    const response = await UserService.requestResetPassword({
      params: { email: "johndoe@mikro.africa" },
    });
    console.log(response);
  });

  it("should fail to request a password reset if an error occurs in auth service", async function () {
    const mockResponse = {
      message: "An error occurred while requesting a password reset",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post(`/password/reset-request`)
      .reply(400, mockResponse);

    UserService.requestResetPassword({ email: "johndoe@mikro.africa" })
      .then()
      .catch((err) => console.log(err));
  });

  it("should successfully reset a user's password", async function () {
    const mockResponse = {
      data: {},
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/reset-password-web`)
      .reply(200, mockResponse);

    const response = await UserService.resetPassword({
      params: resetPasswordParams,
    });
    console.log(response);
  });

  it("should fail reset password if an error occurs in auth service", async function () {
    const mockErrorResponse = {
      message: "Token supplied is invalid",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/reset-password-web`)
      .reply(400, mockErrorResponse);

    UserService.resetPassword({
      params: resetPasswordParams,
    })
      .then()
      .catch((err) => console.log(err));
  });

  it("should successfully change a user's password", async function () {
    const mockResponse = {
      data: {
        data: {
          userId: changePasswordParams.userId,
        },
      },
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/change`)
      .reply(200, mockResponse);

    const response = await UserService.changePassword({
      params: changePasswordParams,
      userId: "some-uuid-pass-word",
    });
    console.log(response);
  });

  it("should fail to change a user's password if an error occurs in auth service", async function () {
    const mockErrorResponse = {
      message: "Password supplied is wrong",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/change`)
      .reply(400, mockErrorResponse);

    UserService.changePassword({
      params: changePasswordParams,
      userId: "123",
    })
      .then()
      .catch((err) => console.log(err));
  });
});
