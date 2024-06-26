import { describe, it } from "mocha";
import chai from "chai";
import sinon from "sinon";
import nock from "nock";
import chaiAsPromised from "chai-as-promised";
import { Owner } from "../../../src/api/resources/owner/owner.model";
import { Outlet } from "../../../src/api/resources/outlet/outlet.model";
import * as TransferService from "../../../src/api/resources/transfer/transfer.service";
import { BAD_REQUEST, OK } from "../../../src/api/modules/status";
import { OutletStatus } from "../../../src/api/resources/outlet/outlet.status";
import * as TransactionService from "../../../src/api/modules/transaction-service";
import * as OutletService from "../../../src/api/resources/outlet/outlet.service";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Owner service Tests", function () {
  const ownerId = "a0558f24c432c";
  const outletId = "b2453a34c43t4";
  const ownerWalletId = "aef2604c-4359-11eb-b378-0242ac130002";
  const outletWalletId = "aef26894-4359-11eb-b378-0242ac130002";

  const mockOutletData = {
    status: true,
    data: {
      firstName: "Outlet",
      lastName: "Awesome",
      fcmToken: "another-fcm-token",
      phoneNumber: "+234 9016 43 834",
    },
  };

  const mockOwnerData = {
    status: true,
    data: {
      firstName: "Owner",
      lastName: "Cool",
      fcmToken: "some-fcm-token",
      phoneNumber: "+234 8145 834",
    },
  };

  it("should transfer between two wallets", async function () {
    const params = {
      amount: 3000,
      destination: "owner",
    };

    const mockTransferResponse = {
      status: true,
      data: {
        id: "d71300e6-315e-4ceb-9cbd-0d91d087ba72",
        amount: 100,
        userId: "5e9a348ecf896e4e613b7fe7",
        transactionReference: "P2P-9cf01f71-a9b2-49db-a349-c64ecdf836b5",
        transactionStatus: "successful",
        transactionType: "p2p",
        user: "alex snow",
        product: null,
        timeCreated: 1608394300931,
      },
    };

    const findOneOwner = sinon.stub(Owner, "findOne").resolves({
      userId: ownerId,
      walletId: ownerWalletId,
    });

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      userId: outletId,
      ownerId,
      walletId: outletWalletId,
      status: OutletStatus.ACTIVE,
    });

    nock(process.env.TRANSACTION_SERVICE_URL)
      .post(`/transactions/create`)
      .reply(OK, mockTransferResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${ownerId}/details`)
      .reply(OK, mockOwnerData);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${outletId}/details`)
      .reply(OK, mockOutletData);

    const response = await TransferService.transfer({
      ownerId,
      outletId,
      params,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    findOneOwner.restore();
    sinon.assert.calledOnce(findOneOwner);

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });

  it("should fail to transfer if an invalid destination is supplied", async function () {
    const ownerId = "a0558f24c432c";
    const outletId = "b2453a34c43t4";

    const params = {
      amount: 100,
      destination: "fakeDestination",
    };

    try {
      await TransferService.transfer({
        ownerId,
        outletId,
        params,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.equals(
        '"destination" must be one of [owner, outlet, bank]'
      );
    }
  });

  it("should fail to transfer between two wallets if balance is not sufficient", async function () {
    const params = {
      amount: 1000,
      destination: "owner",
    };

    const mockFailedTransferResponse = {
      status: true,
      message: "Wallet balance is insufficient",
    };

    const findOneOwner = sinon.stub(Owner, "findOne").resolves({
      userId: ownerId,
      walletId: ownerWalletId,
    });

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      userId: outletId,
      ownerId,
      walletId: outletWalletId,
      status: OutletStatus.ACTIVE,
    });

    nock(process.env.TRANSACTION_SERVICE_URL)
      .post(`/transactions/create`)
      .reply(BAD_REQUEST, mockFailedTransferResponse);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${ownerId}/details`)
      .reply(OK, mockOwnerData);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${outletId}/details`)
      .reply(OK, mockOutletData);

    try {
      await TransferService.transfer({
        ownerId,
        outletId,
        params,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.equals("Wallet balance is insufficient");
    }

    findOneOwner.restore();
    sinon.assert.calledOnce(findOneOwner);

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });

  it("should successfully transfer to other banks", async function () {
    const params = {
      amount: 10,
      accountNumber: "21367894409",
      destination: "bank",
      bankCode: "073",
      productCategory: "011",
      recipientBank: "bank",
      recipientName: "name",
      recipientAccountNumber: "21367894409",
      serviceFee: "100",
    };

    const mockTransferResponse = {
      status: true,
      data: {
        id: "d71300e6-315e-4ceb-9cbd-0d91d087ba72",
        amount: 100,
        userId: "5e9a348ecf896e4e613b7fe7",
        transactionReference: "P2P-9cf01f71-a9b2-49db-a349-c64ecdf836b5",
        transactionStatus: "successful",
        transactionType: "p2p",
        user: "alex snow",
        product: null,
        timeCreated: 1608394300931,
      },
    };

    const findOneOwner = sinon.stub(Owner, "findOne").resolves({
      userId: ownerId,
      walletId: ownerWalletId,
    });

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      userId: outletId,
      ownerId,
      walletId: outletWalletId,
      status: OutletStatus.ACTIVE,
    });

    const type = "TRANSFER";

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${ownerId}/details`)
      .reply(OK, mockOwnerData);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${outletId}/details`)
      .reply(OK, mockOutletData);

    nock(process.env.TRANSACTION_SERVICE_URL)
      .post(`/transactions/create`)
      .reply(OK, mockTransferResponse);

    const response = await TransferService.transfer({
      ownerId,
      outletId,
      params,
    });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    findOneOwner.restore();
    sinon.assert.calledOnce(findOneOwner);

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });

  it("should fail to transfer to other banks if wallet balance is insufficient", async function () {
    const params = {
      amount: 10000,
      accountNumber: "21367894409",
      destination: "bank",
      bankCode: "073",
      productCategory: "011",
      recipientBank: "bank",
      recipientName: "name",
      recipientAccountNumber: "21367894409",
      serviceFee: "100",
    };

    const mockFailedTransferResponse = {
      status: true,
      message: "Wallet balance is insufficient",
    };

    const findOneOwner = sinon.stub(Owner, "findOne").resolves({
      userId: ownerId,
      walletId: ownerWalletId,
    });

    const findOneOutlet = sinon.stub(Outlet, "findOne").resolves({
      userId: outletId,
      ownerId,
      walletId: outletWalletId,
      status: OutletStatus.ACTIVE,
    });

    const type = "TRANSFER";

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${ownerId}/details`)
      .reply(OK, mockOwnerData);

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${outletId}/details`)
      .reply(OK, mockOutletData);

    nock(process.env.TRANSACTION_SERVICE_URL)
      .post(`/transactions/create`)
      .reply(OK, mockFailedTransferResponse);

    try {
      await TransferService.transfer({
        ownerId,
        outletId,
        params,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.equals("Wallet balance is insufficient");
    }

    findOneOwner.restore();
    sinon.assert.calledOnce(findOneOwner);

    findOneOutlet.restore();
    sinon.assert.calledOnce(findOneOutlet);
  });

  it("should successfully validate account number", async function () {
    const params = {
      accountNumber: "0450758897",
      bankCode: "058",
    };

    const mockAccountValidationResponse = {
      status: true,
      data: {
        bankCode: "098",
        bankName: "Bank",
        accountName: "Name",
        accountNumber: "0450758567",
      },
    };

    nock(process.env.PAYMENT_SERVICE_URL)
      .post("/validate")
      .reply(OK, mockAccountValidationResponse);

    const response = await TransferService.validateAccountNumber({
      params,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully get service fee", async function () {
    const type = "TRANSFER";
    const params = {
      amount: "100",
    };

    const mockServiceFeeResponseData = {
      status: true,
      data: "120",
    };

    nock(process.env.TRANSACTION_SERVICE_URL)
      .post(`/transactions/${type}/fee`)
      .reply(OK, mockServiceFeeResponseData);

    const response = await TransferService.getServiceFee({
      params,
      type,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully fetch supported banks", async function () {
    const mockSupportedBankResponseData = {
      status: true,
      data: {
        name: "GTBank",
        code: "011",
        sortCode: "058152",
        nibssCode: "0013",
        url: "https://bank.com",
      },
    };

    nock(process.env.PAYMENT_SERVICE_URL)
      .get("/banks")
      .reply(OK, mockSupportedBankResponseData);

    const response = await TransferService.fetchBanks();
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });
});
