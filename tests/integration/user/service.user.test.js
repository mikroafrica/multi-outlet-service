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

    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });

  it("should fail to create a user if consumer service returns an error", async function () {
    const mockResponse = {
      message: "User account exists",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post("/user/create/OUTLET_OWNER")
      .reply(400, mockResponse);

    try {
      await UserService.signupMultiOutletOwner(signupParams);
    } catch (err) {
      expect(err.statusCode).equals(400);
      expect(err.message).exist;
    }
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

    try {
      await UserService.signupMultiOutletOwner(signupParams);
    } catch (err) {
      expect(err.statusCode).equals(409);
      expect(err.message).exist;
    }
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

    expect(response.statusCode).equals(200);
    expect(response.data).exist;
  });

  it("should fail to login a user when user details are wrong", async function () {
    const failedLoginMockResponse = {
      statusCode: 401,
      message: "Invalid credentials",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(401, failedLoginMockResponse);

    try {
      await UserService.loginMultiOutletOwner({ params: loginParams });
    } catch (err) {
      expect(err.statusCode).equals(401);
      expect(err.message).to.exist;
    }
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

    try {
      await UserService.loginMultiOutletOwner({ params: loginParams });
    } catch (err) {
      expect(err.statusCode).equals(403);
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
      .reply(200, sendVerificationMockResponse);

    const response = await UserService.sendVerificationEmail("007");
    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });

  it("should fail to send a verification email if userId is undefined", async function () {
    try {
      await UserService.sendVerificationEmail();
    } catch (err) {
      expect(err.statusCode).equals(400);
      expect(err.message).to.exist;
    }
  });

  it("should fail to send a verification email if an error occurs at consumer service", async function () {
    const mockErrorResponse = {
      statusCode: 400,
      message: "Could not send Verification email",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-verification`)
      .reply(400, mockErrorResponse);

    try {
      await UserService.sendVerificationEmail("007");
    } catch (err) {
      expect(err.statusCode).equals(400);
      expect(err.message).to.exist;
    }
  });

  it("should successfully validate an email", async function () {
    const mockResponse = {
      data: {},
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-validation`)
      .reply(200, mockResponse);

    const response = await UserService.validateEmail(validateEmailParams);
    expect(response.statusCode).equals(200);
  });

  it("should fail to validate email if consumer service throws an error", async function () {
    const mockErrorResponse = {
      message: "Email has been verified previously",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/email-validation`)
      .reply(400, mockErrorResponse);

    try {
      await UserService.validateEmail(validateEmailParams);
    } catch (err) {
      expect(err.statusCode).equals(400);
      expect(err.message).to.exist;
    }
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
    expect(response.statusCode).equals(200);
  });

  it("should fail to request a password reset if an error occurs in auth service", async function () {
    const mockResponse = {
      message: "An error occurred while requesting a password reset",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post(`/password/reset-request`)
      .reply(400, mockResponse);
    try {
      await UserService.requestResetPassword({ email: "johndoe@mikro.africa" });
    } catch (err) {
      expect(err.statusCode).equals(400);
      expect(err.message).to.exist;
    }
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
    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });

  it("should fail reset password if an error occurs in auth service", async function () {
    const mockErrorResponse = {
      message: "Token supplied is invalid",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/reset-password-web`)
      .reply(400, mockErrorResponse);

    try {
      await UserService.resetPassword({
        params: resetPasswordParams,
      });
    } catch (err) {
      expect(err.statusCode).equals(400);
      expect(err.message).to.exist;
    }
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

    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });

  it("should fail to change a user's password if an error occurs in auth service", async function () {
    const mockErrorResponse = {
      message: "Password supplied is wrong",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/password/change`)
      .reply(400, mockErrorResponse);

    try {
      await UserService.changePassword({
        params: changePasswordParams,
        userId: "123",
      });
    } catch (err) {
      expect(err.statusCode).equals(400);
      expect(err.message).to.exist;
    }
  });

  it("should successfully update a user", async function () {
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
      },
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${userId}/details`)
      .reply(200, mockUserDetailsResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .put(`/user/${userId}/profile`)
      .reply(200, mockUpdateProfileResponse);

    const response = await UserService.updateUser({
      params,
      userId,
    });

    expect(response.statusCode).equals(200);
    expect(response.data).to.exist;
  });

  it("should fail to update a user if user details cannot be found", async function () {
    const userId = "123";
    const params = {
      firstName: "John",
      lastName: "Doe",
      businessName: "Good Stores",
      address: "12 Salami Street",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${userId}/details`)
      .reply(400, { statusCode: 400, message: "Could not find user details" });

    try {
      await UserService.updateUser({
        params,
        userId,
      });
    } catch (err) {
      console.log(err);
      expect(err.statusCode).equals(400);
      expect(err.message).to.exist;
    }
  });

  it("should fail to update a user if consumer service fails to update a user", async function () {
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
      .reply(200, mockUserDetailsResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .put(`/user/${userId}/profile`)
      .reply(400, { statusCode: 400, message: "Failed to update a user" });

    try {
      await UserService.updateUser({
        params,
        userId,
      });
    } catch (err) {
      console.log(err);
      expect(err.statusCode).equals(400);
      expect(err.message).to.exist;
    }
  });
});
