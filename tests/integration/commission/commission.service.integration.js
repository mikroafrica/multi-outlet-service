// import { describe, it } from "mocha";
// import sinon from "sinon";
// import nock from "nock";
// import chai from "chai";
// import chaiAsPromised from "chai-as-promised";
// import { Commission } from "../../../src/api/resources/commission/commission.model";
// import * as CommissionService from "../../../src/api/resources/commission/commission.service";
// import { Owner } from "../../../src/api/resources/owner/owner.model";
// import {
//   BAD_REQUEST,
//   NOT_FOUND,
//   OK,
//   UN_AUTHORISED,
// } from "../../../src/api/modules/status";
//
// chai.use(chaiAsPromised);
// const expect = chai.expect;
//
// describe("Commission service Tests", function () {
//   it("should create commission settings for partners when valid commision parameters are supplied", async function () {
//     const ownerId = "5ff84b6929be4225a084874a";
//     const userId = "vhvuyi9";
//     const type = "ONBOARDING";
//
//     const params = {
//       condition: 1234,
//       multiplier: 5,
//       type: "ONBOARDING",
//     };
//
//     const existingCommission = sinon.stub(Commission, "findOne").resolves({
//       type,
//       level: null,
//     });
//
//     const findOneAndUpdateCommission = sinon
//       .stub(Commission, "findOneAndUpdate")
//       .resolves({
//         type,
//         condition: params.condition,
//         multiplier: params.multiplier,
//       });
//
//     sinon.stub(Commission.prototype, "save").resolves({
//       condition: params.condition,
//       multiplier: params.multiplier,
//       owner: ownerId,
//       type,
//     });
//
//     const response = await CommissionService.createCommission({
//       params,
//       ownerId,
//     });
//
//     // expect(response.statusCode).equals(OK);
//     // expect(response.data).to.exist;
//
//     existingCommission.restore();
//     sinon.assert.calledOnce(existingCommission);
//     findOneAndUpdateCommission.restore();
//     sinon.assert.calledOnce(findOneAndUpdateCommission);
//   });
//
//   it("should successfully fetch commissions balance for a patner when userId is supplied", async function () {
//     const userId = "rtyghbnj79";
//
//     const partnerCommission = sinon
//       .stub(CommissionBalance, "find")
//       .resolves({ owner: userId });
//
//     const response = await CommissionService.getOwnerCommissionBalance({
//       userId,
//     });
//
//     expect(response.statusCode).equals(OK);
//     expect(response.data).to.exist;
//
//     partnerCommission.restore();
//     sinon.assert.calledOnce(partnerCommission);
//   });
//
//   it("should successfully get partner approval status", async function () {
//     const userId = "5ff84b6929be4225a084874a";
//
//     const partner = sinon.stub(Owner, "findOne").resolves({ userId });
//
//     const partnerCommission = sinon
//       .stub(Commission, "find")
//       .resolves({ owner: userId });
//
//     const response = await CommissionService.getOwnerApprovalStatus({
//       userId,
//     });
//
//     expect(response.statusCode).equals(OK);
//     expect(response.data).to.exist;
//
//     partner.restore();
//     sinon.assert.calledOnce(partner);
//     partnerCommission.restore();
//     sinon.assert.calledOnce(partnerCommission);
//   });
//
//   it("should successfully get owner commission settings", async function () {
//     const userId = "5ff84b6929be4225a084874a";
//
//     const commissionSettings = sinon
//       .stub(Commission, "find")
//       .resolves({ owner: userId });
//
//     const response = await CommissionService.getOwnerCommissionSettings({
//       userId,
//     });
//
//     expect(response.statusCode).equals(OK);
//     expect(response.data).to.exist;
//
//     commissionSettings.restore();
//     sinon.assert.calledOnce(commissionSettings);
//   });
//
//   it("should successfully update owner commission settings", async function () {
//     const userId = "5ff84b6929be4225a084874a";
//
//     const params = {
//       condition: 1000,
//       multiplier: 5,
//     };
//
//     const updatedCommission = sinon
//       .stub(Commission, "findOneAndUpdate")
//       .resolves({
//         owner: userId,
//         _id: "dythgng79",
//         condition: params.condition,
//         multiplier: params.multiplier,
//       });
//
//     const response = await CommissionService.updateOwnerCommissionSettings({
//       params,
//       userId,
//       ownerId: userId,
//     });
//
//     expect(response.statusCode).equals(OK);
//     expect(response.data).to.exist;
//
//     updatedCommission.restore();
//     sinon.assert.calledOnce(updatedCommission);
//   });
// });
