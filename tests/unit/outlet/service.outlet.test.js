import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as OutletService from "../../../src/api/resources/outlet/outlet.service";
import sinon from "sinon";
import { Outlet } from "../../../src/api/resources/outlet/outlet.model";
import { OutletStatus } from "../../../src/api/resources/outlet/outlet.status";

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

    const outlet = new Outlet();
    const saveOutlet = sinon.mock(outlet).expects("save").resolves({
      outletId: "outlet-id",
      ownerId: "owner-id",
      outletStatus: OutletStatus.ACTIVE,
      isOutletSuspended: false,
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

    saveOutlet.restore();
    sinon.assert.calledOnce(saveOutlet);
    // expect(response.statusCode).to.be.number;
  });
});
