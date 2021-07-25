import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as OutletService from "../../../src/api/resources/outlet/outlet.service";
import sinon from "sinon";
import { Outlet } from "../../../src/api/resources/outlet/outlet.model";
import { OutletStatus } from "../../../src/api/resources/outlet/outlet.status";
import { Verification } from "../../../src/api/resources/outlet/verification.model";
import {
  BAD_REQUEST,
  NOT_FOUND,
  OK,
  UN_AUTHORISED,
} from "../../../src/api/modules/status";
import { UserType } from "../../../src/api/resources/owner/user.type";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Outlet service Tests", function () {
  const linkOutletParams = {
    phoneNumber: "08023548769",
    pin: "1234",
  };

  it("should successfully link an outlet to an owner up a multi-outlet user", async function () {
    const mockAuthResponse = {
      data: {
        userId: "123",
        token: "eyjkfbhfehjgve",
      },
    };

    const mockUserDetailsResponse = {
      data: {
        id: "1",
        firstName: "John",
        lastName: "Doe",
      },
    };

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves(null);
    const findOneVerification = sinon
      .stub(Verification, "findOne")
      .resolves(null);

    const outlet = new Outlet();
    sinon.stub(outlet, "save").resolves({
      outletUserId: "outlet-id",
      ownerId: "owner-id",
      outletStatus: OutletStatus.ACTIVE,
      isOutletSuspended: false,
    });

    sinon.stub(Verification.prototype, "save").resolves({
      verificationId: "verification-id",
      outletUserId: "outlet-id",
      ownerId: "owner-id",
      status: "CODE_SENT",
    });

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(OK, mockAuthResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${mockAuthResponse.data.userId}/details`)
      .reply(OK, mockUserDetailsResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/otp`)
      .reply(OK, { statusCode: OK, data: { verificationId: "2h4242h" } });

    const response = await OutletService.linkOwnerToOutlet({
      params: linkOutletParams,
      userId: "1234",
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
    findOneVerification.restore();
    sinon.assert.calledOnce(findOneVerification);
  });

  it("should fail to link an outlet if linking details are incorrect", async function () {
    const mockAuthResponse = {
      message: "Username of password incorrect",
    };

    nock(process.env.AUTH_SERVICE_URL)
      .post("/auth/login")
      .reply(UN_AUTHORISED, mockAuthResponse);

    try {
      await OutletService.linkOwnerToOutlet({
        params: linkOutletParams,
        userId: "1234",
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should successfully unlink an outlet", async function () {
    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      userId: "outlet-id",
      ownerId: "owner-id",
      walletId: "some-gene-rated-uuid",
      status: OutletStatus.ACTIVE,
    });

    const findOneAndDeleteOutlet = sinon.stub(Outlet, "findOneAndDelete");
    findOneAndDeleteOutlet.resolves({});

    const response = await OutletService.unlinkOutletFromOwner({
      outletUserId: 4579,
      ownerId: "1234",
    });
    expect(response.statusCode).equals(OK);

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);

    findOneAndDeleteOutlet.restore();
    sinon.assert.calledOnce(findOneAndDeleteOutlet);
  });

  it("should fail to unlink an outlet if outlet is not found", async function () {
    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves(null);

    try {
      await OutletService.unlinkOutletFromOwner({
        outletUserId: "4579",
        ownerId: "1234",
      });
    } catch (e) {
      expect(e.statusCode).equals(NOT_FOUND);
      expect(e.message).to.exist;
    }

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });

  it("should successfully switch an outlet status", async function () {
    const outletId = "4579";
    const status = OutletStatus.SUSPENDED;

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      ownerId: "some-id",
      userId: "outlet-owner-id",
    });

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/auth/${outletId}/INACTIVE/status`)
      .reply(OK, {
        statusCode: OK,
      });

    const findOneAndUpdateOutlet = sinon
      .stub(Outlet, "findOneAndUpdate")
      .resolves({
        userId: outletId,
        ownerId: "owner-id",
        walletId: "some-uuid",
        status: OutletStatus.ACTIVE,
      });

    const response = await OutletService.switchOutletSuspendedStatus({
      outletUserId: outletId,
      userId: "user-id-001",
      status,
    });
    expect(response.statusCode).equals(OK);

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);

    findOneAndUpdateOutlet.restore();
    sinon.assert.calledOnce(findOneAndUpdateOutlet);
  });

  it("should fail to switch outlet status when status is invalid", async function () {
    const outletUserId = 4579;

    try {
      await OutletService.switchOutletSuspendedStatus({
        outletUserId,
        userId: "user-id-001",
        status: "RANDOM_STATUS",
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.equals(
        "Invalid status supplied. Please supply a valid status"
      );
    }
  });

  it("should fail to switch outlet status when outlet cannot be found", async function () {
    const outletUserId = 4579;

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves(null);

    try {
      await OutletService.switchOutletSuspendedStatus({
        outletUserId,
        userId: "user-id-001",
        status: OutletStatus.ACTIVE,
      });
    } catch (err) {
      expect(err.statusCode).equals(404);
      expect(err.message).to.equals("Could not find outlet");
    }
    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });

  it("should fail to switch outlet status if error occurs on auth service", async function () {
    const outletUserId = 4579;
    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      ownerId: "some-id",
      outletUserId: "outlet-owner-id",
    });

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/auth/${outletUserId}/INACTIVE/status`)
      .reply(BAD_REQUEST, {
        statusCode: BAD_REQUEST,
        message: "User not be found",
      });

    try {
      await OutletService.switchOutletSuspendedStatus({
        outletUserId,
        userId: "user-id-001",
        status: OutletStatus.SUSPENDED,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.equals(
        "Could not switch outlet status. Try again"
      );
    }
    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });

  it("should successfully send verification OTP", async function () {
    const phoneNumber = 23480785858595;

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/otp`)
      .reply(OK, {
        statusCode: OK,
        data: {
          verificationId: "jbvrj34ng",
        },
      });

    const response = await OutletService.sendVerificationOtp({ phoneNumber });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to send verification OTP if an error occurs on consumer service", async function () {
    const phoneNumber = 23480785858595;

    nock(process.env.CONSUMER_SERVICE_URL).post(`/otp`).reply(BAD_REQUEST, {
      statusCode: BAD_REQUEST,
      message: "Could not send OTP to user",
    });

    try {
      await OutletService.sendVerificationOtp({ phoneNumber });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.equals("Could not send verification OTP");
    }
  });

  // it("should successfully verify outlet linking", async function () {
  //   const verificationId = "h47fbh4h44h49f";
  //   const otpCode = "903875";
  //   const outletUserId = "outlet-owner-id";
  //
  //   const params = {
  //     otpCode,
  //     verificationId,
  //   };
  //
  //   nock(process.env.CONSUMER_SERVICE_URL)
  //     .get(`/otp/${verificationId}/${otpCode}/validate`)
  //     .reply(OK, {
  //       statusCode: OK,
  //     });
  //
  //   nock(process.env.CONSUMER_SERVICE_URL)
  //     .get(`/user/${outletUserId}/details`)
  //     .reply(OK, {
  //       statusCode: OK,
  //       data: {
  //         userId: outletUserId,
  //         store: [
  //           {
  //             wallet: [{ id: "htsg-83b3", currency: "NGN" }],
  //           },
  //         ],
  //       },
  //     });
  //
  //   const findOneVerification = sinon.stub(Verification, "findOne").resolves({
  //     ownerId: "someid",
  //     outletUserId,
  //   });
  //
  //   const findOneAndDeleteVerification = sinon.stub(Verification, "findOneAndDelete");
  //   findOneAndDeleteVerification.resolves({});
  //
  //   const findOneOutlet = sinon.stub(Outlet, "findOne").resolves(null);
  //
  //   const outlet = new Outlet();
  //   sinon.mock(outlet).expects("save").resolves({
  //     userId: "outlet-owner-id",
  //     ownerId: "ownerId",
  //     outletStatus: OutletStatus.ACTIVE,
  //   });
  //   const response = await OutletService.verifyOutletLinking({ params });
  //
  //   expect(response.statusCode).equals(OK);
  //   expect(response.data).to.exist;
  //
  //   findOneVerification.restore();
  //   sinon.assert.calledOnce(findOneVerification);
  //   findOneOutlet.restore();
  //   sinon.assert.calledOnce(findOneOutlet);
  //   findOneAndDeleteVerification.restore();
  //   sinon.assert.calledOnce(findOneAndDeleteVerification);
  // });

  it("should fail to verify outlet linking when otp validation fails", async function () {
    const verificationId = "h47fbh4h44h49f";
    const otpCode = "903875";

    const params = {
      otpCode,
      verificationId,
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/otp/${verificationId}/${otpCode}/validate`)
      .reply(BAD_REQUEST, {
        statusCode: BAD_REQUEST,
        message: "OTP has expired",
      });

    try {
      await OutletService.verifyOutletLinking({ params });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.equals("OTP has expired");
    }
  });

  it("should fail to verify outlet when outlet doesn't have a wallet", async function () {
    const verificationId = "h47fbh4h44h49f";
    const otpCode = "903875";
    const outletUserId = "outlet-owner-id";

    const params = {
      otpCode,
      verificationId,
    };

    const findOneVerification = sinon.stub(Verification, "findOne").resolves({
      ownerId: "someid",
      outletUserId,
    });

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves(null);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/otp/${verificationId}/${otpCode}/validate`)
      .reply(OK, {
        statusCode: OK,
      });

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${outletUserId}/details`)
      .reply(OK, {
        statusCode: OK,
        data: {
          userId: outletUserId,
          store: [
            {
              wallet: [],
            },
          ],
        },
      });

    try {
      await OutletService.verifyOutletLinking({ params });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.equals(
        "Could not verify outlet linking. Please try again"
      );
    }

    findOneVerification.restore();
    sinon.assert.calledOnce(findOneVerification);
    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });
});
