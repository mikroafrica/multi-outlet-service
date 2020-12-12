import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as OutletService from "../../../src/api/resources/outlet/outlet.service";
import sinon from "sinon";
import { Outlet } from "../../../src/api/resources/outlet/outlet.model";
import { OutletStatus } from "../../../src/api/resources/outlet/outlet.status";
import { Verification } from "../../../src/api/resources/outlet/verification.model";

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
      .reply(200, mockAuthResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${mockAuthResponse.data.userId}/details`)
      .reply(200, mockUserDetailsResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/otp`)
      .reply(200, { data: { verificationId: "2h4242h" } });

    const response = await OutletService.linkOwnerToOutlet({
      params: linkOutletParams,
      userId: "1234",
    });
    console.log(response);

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
    findOneVerification.restore();
    sinon.assert.calledOnce(findOneVerification);
  });

  it("should successfully unlink an outlet", async function () {
    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      outletUserId: "outlet-id",
      ownerId: "owner-id",
      outletStatus: OutletStatus.ACTIVE,
      isOutletSuspended: false,
    });

    const findOneAndUpdateOutlet = sinon.stub(Outlet, "findOneAndUpdate");
    findOneAndUpdateOutlet.resolves({
      exec: () => {
        return {};
      },
    });

    const response = await OutletService.unlinkOutletFromOwner({
      outletUserId: "4579",
      userId: "1234",
    });
    console.log(response);

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);

    findOneAndUpdateOutlet.restore();
    sinon.assert.calledOnce(findOneAndUpdateOutlet);
  });

  it("should fail to unlink an outlet if outlet is not found", async function () {
    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves(null);

    OutletService.unlinkOutletFromOwner({
      outletUserId: "4579",
      userId: "1234",
    })
      .then()
      .catch((err) => console.log(err));

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });

  it("should successfully suspend an outlet", async function () {
    const outletUserId = 4579;

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      ownerId: "someid",
      outletUserId: "outlet-owner-id",
    });

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/auth/${outletUserId}/INACTIVE/status`)
      .reply(200, {
        statusCode: 200,
      });

    const findOneAndUpdateOutlet = sinon
      .stub(Outlet, "findOneAndUpdate")
      .resolves({
        exec: () => ({
          outletUserId,
          ownerId: "owner-id",
          outletStatus: OutletStatus.ACTIVE,
          isOutletSuspended: true,
        }),
      });

    const response = await OutletService.suspendOutlet({
      outletUserId,
      userId: "user-id",
    });

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);

    findOneAndUpdateOutlet.restore();
    sinon.assert.calledOnce(findOneAndUpdateOutlet);
  });

  it("should fail to suspend an outlet if an error occurs while updating user status", async function () {
    const outletUserId = "4579";
    const ownerId = "owner-id";

    nock(process.env.AUTH_SERVICE_URL)
      .put(`/auth/${outletUserId}/INACTIVE/status`)
      .reply(400, {
        statusCode: 400,
        message: "User not be found",
      });

    OutletService.suspendOutlet({
      outletUserId,
      userId: ownerId,
    })
      .then()
      .catch((err) => {
        console.log(err);
      });
  });

  it("should successfully send verification OTP", async function () {
    const phoneNumber = 23480785858595;

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/otp`)
      .reply(200, {
        statusCode: 200,
        data: {
          verificationId: "jbvrj34ng",
        },
      });

    const response = await OutletService.sendVerificationOtp({ phoneNumber });
    console.log(response);
  });

  it("should successfully verify outlet linking", async function () {
    const verificationId = "h47fbh4h44h49f";
    const otpCode = "903875";

    const params = {
      otpCode,
      verificationId,
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/otp/${verificationId}/${otpCode}/validate`)
      .reply(200, {
        statusCode: 200,
      });

    const findOneVerification = sinon.stub(Verification, "findOne").resolves({
      ownerId: "someid",
      outletUserId: "outlet-owner-id",
    });

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      ownerId: "someid",
      outletUserId: "outlet-owner-id",
    });

    const outlet = new Outlet();
    sinon.mock(outlet).expects("save").resolves({
      outletUserId: "outlet-owner-id",
      ownerId: "ownerId",
      outletStatus: OutletStatus.ACTIVE,
    });
    const response = await OutletService.verifyOutletLinking({ params });
    console.log(response);
    findOneVerification.restore();
    sinon.assert.calledOnce(findOneVerification);

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });

  it("should fail to verify outlet linking when otp validation fails", async function () {
    const verificationId = "h47fbh4h44h49f";
    const otpCode = "903875";

    const params = {
      otpCode,
      verificationId,
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/otp/${verificationId}/${otpCode}/validate`)
      .reply(400, {
        statusCode: 400,
        message: "OTP has expired",
      });

    OutletService.verifyOutletLinking({ params })
      .then()
      .catch((err) => console.log(err));
  });
});
