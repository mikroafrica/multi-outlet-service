import { describe, it } from "mocha";
import sinon from "sinon";
import nock from "nock";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { Commission } from "../../../src/api/resources/commission/commission.model";
import * as CommissionService from "../../../src/api/resources/commission/commission.service";
import { Owner } from "../../../src/api/resources/owner/owner.model";
import {
  BAD_REQUEST,
  NOT_FOUND,
  OK,
  UN_AUTHORISED,
} from "../../../src/api/modules/status";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Commission service Tests", function () {
  it("should create commission of rangeType non-range", async function () {
    const ownerId = "5ff84b6929be4225a084874a";
    const userId = "vhvuyi9";

    const params = {
      name: "TEST_COMMISSION",
      category: "POS_WITHDRAWAL",
      rangeType: "NON_RANGE",
      feeType: "FLAT_FEE",
      serviceFee: 5000,
    };

    const existingCommission = sinon.stub(Commission, "findOne").resolves(null);

    const newCommission = sinon.stub(Commission, "create").resolves({
      name: "TEST_COMMISSION",
      category: "POS_WITHDRAWAL",
      rangeType: "NON_RANGE",
      feeType: "FLAT_FEE",
      serviceFee: 5000,
    });

    const response = await CommissionService.create({ params });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    existingCommission.restore();
    sinon.assert.calledOnce(existingCommission);

    newCommission.restore();
    sinon.assert.calledOnce(newCommission);
  });

  it("should create commission of rangeType range", async function () {
    const ownerId = "5ff84b6929be4225a084874a";
    const userId = "vhvuyi9";

    const params = {
      name: "sample_test",
      category: "TRANSFER",
      rangeType: "RANGE",
      rangeList: [
        {
          serviceFee: 1000,
          feeType: "PERCENTAGE",
          rangeAmount: {
            from: 100,
            to: 5000,
          },
        },
      ],
    };

    const existingCommission = sinon.stub(Commission, "findOne").resolves(null);

    const newCommission = sinon.stub(Commission, "create").resolves({
      name: "sample_test",
      category: "TRANSFER",
      rangeType: "RANGE",
      rangeList: [
        {
          serviceFee: 1000,
          feeType: "PERCENTAGE",
          rangeAmount: {
            from: 100,
            to: 5000,
          },
        },
      ],
    });

    const response = await CommissionService.create({
      params,
    });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    existingCommission.restore();
    sinon.assert.calledOnce(existingCommission);

    newCommission.restore();
    sinon.assert.calledOnce(newCommission);
  });

  it("should successfully fetch all existing commissions.", async function () {
    const existingCommission = sinon.stub(Commission, "find").resolves([
      {
        name: "Onboarding south",
        rangeType: "RANGE",
        category: "ON_BOARDING",
      },
    ]);

    const response = await CommissionService.getAllCommissions();

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    existingCommission.restore();
    sinon.assert.calledOnce(existingCommission);
  });

  it("should successfully update commission", async function () {
    const id = "0166254";

    const params = {
      name: "updated commission",
      category: "POS_WITHDRAWAL",
      rangeType: "NON_RANGE",
      feeType: "FLAT_FEE",
      serviceFee: 2000,
    };

    const commission = sinon.stub(Commission, "findOne").resolves({
      name: "updated commission",
      category: "POS_WITHDRAWAL",
      rangeType: "NON_RANGE",
      feeType: "FLAT_FEE",
    });

    try {
      const newCommission = sinon
        .stub(Commission, "findOneAndUpdate")
        .resolves({
          name: "updated commission",
          category: "POS_WITHDRAWAL",
          rangeType: "NON_RANGE",
          feeType: "FLAT_FEE",
          serviceFee: 2000,
        });

      const response = await CommissionService.update({ params, id });
    } catch (err) {
      console.log(err);
    }

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    commission.restore();
    sinon.assert.calledOnce(commission);

    newCommission.restore();
    sinon.assert.calledOnce(newCommission);
  });
});
