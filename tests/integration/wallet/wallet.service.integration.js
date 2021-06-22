import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import * as WalletService from "../../../src/api/resources/wallet/wallet.service";
import { Owner } from "../../../src/api/resources/owner/owner.model";
import { BAD_REQUEST, OK } from "../../../src/api/modules/status";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Wallet service Tests", function () {
  it("should successfully get multi-outlet owner wallet", async function () {
    const ownerId = "f1ef49f2-6a56-4491-a389-e06b14e0c3b1";
    const walletId = "70d1fcce-2a29-4be1-8672-0f845d8f48e3";

    const mockWalletResponse = {
      status: true,
      data: {
        id: "f149f2-6a56-449-a389-e06b14e0c3b",
        balance: 0,
        totalCredit: 0,
        totalDebit: 0,
        numberOfTransaction: 0,
        currency: "NGN",
        timeCreated: 1607408981460,
      },
    };
    const findOneOwner = sinon.stub(Owner, "findOne").resolves({
      userId: ownerId,
      walletId,
    });

    nock(process.env.WALLET_SERVICE_URL)
      .get(`/wallets/${walletId}`)
      .reply(OK, mockWalletResponse);

    const response = await WalletService.walletById({ ownerId });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;

    findOneOwner.restore();
    sinon.assert.calledOnce(findOneOwner);
  });

  it("should fail to get multi-outlet owner wallet when an error occurs in wallet service", async function () {
    const ownerId = "f1ef49f2-6a56-4491-a389-e06b14e0c3b1";
    const walletId = "70d1fcce-2a29-4be1-8672-0f845d8f48e3";

    const findOneOwner = sinon.stub(Owner, "findOne").resolves({
      userId: ownerId,
      walletId,
    });

    const mockWalletResponse = {
      status: false,
      message: "Could not find fetch user wallet",
    };

    nock(process.env.WALLET_SERVICE_URL)
      .get(`/wallets/${walletId}`)
      .reply(BAD_REQUEST, mockWalletResponse);

    try {
      await WalletService.walletById({ ownerId });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }

    findOneOwner.restore();
    sinon.assert.calledOnce(findOneOwner);
  });

  it("should successfully get wallet summary by wallet id", async function () {
    const walletId = "43b5dab8-3de4-11eb-b378-0242ac130002";
    const dateTo = 15000000;
    const dateFrom = 200000;

    const mockResponse = {
      status: true,
      data: {
        id: "f1ef2-6a56-441-a389-e06b10c",
        balance: 0,
        totalCredit: 0,
        totalDebit: 0,
        numberOfTransaction: 0,
        currency: "NGN",
        timeCreated: 1607408981460,
      },
    };

    nock(process.env.WALLET_SERVICE_URL)
      .get(
        `/transactions/${walletId}/balance?dateFrom=${dateFrom}&dateTo=${dateTo}`
      )
      .reply(OK, mockResponse);

    const response = await WalletService.walletSummaryById({
      walletId,
      dateTo,
      dateFrom,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to get wallet summary if an error occurs in wallet service", async function () {
    const walletId = "43b5dab8-3de4-11eb-b378-0242ac130002";
    const dateTo = 15000000;
    const dateFrom = 200000;

    const mockResponse = {
      status: false,
      message: "An error occurred when fetching wallet summary",
    };

    nock(process.env.WALLET_SERVICE_URL)
      .get(
        `/transactions/${walletId}/balance?dateFrom=${dateFrom}&dateTo=${dateTo}`
      )
      .reply(BAD_REQUEST, mockResponse);

    try {
      await WalletService.walletSummaryById({
        walletId,
        dateTo,
        dateFrom,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });

  it("should successfully get wallet transactions", async function () {
    const walletId = "f1ef49f2-6a56-4491-a389-e06b14e0c3b1";
    const dateTo = 15000000;
    const dateFrom = 200000;

    const mockResponse = {
      status: true,
      data: [
        {
          id: "fd88fb65-be9b-43b9-87e0-73f7b99c6f63",
          amount: 248.62,
          balance: 2012137.53,
          transactionType: "CREDIT",
          reference: "WDL-05f9cdd8-65af-4c97-85bd-f97992deb158-CREDIT",
          timeCreated: 1607872095423,
        },
      ],
    };

    nock(process.env.WALLET_SERVICE_URL)
      .get(`/transactions/${walletId}?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      .reply(OK, mockResponse);

    const response = await WalletService.walletTransactionsById({
      walletId,
      dateTo,
      dateFrom,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to get wallet transactions if an error occurs in wallet service", async function () {
    const walletId = "f1ef49f2-6a56-4491-a389-e06b14e0c3b1";
    const dateTo = 15000000;
    const dateFrom = 200000;

    const mockResponse = {
      status: false,
      data: [
        {
          id: "fd88fb65-be9b-43b9-87e0-73f7b99c6f63",
          amount: 248.62,
          balance: 2012137.53,
          transactionType: "CREDIT",
          reference: "WDL-05f9cdd8-65af-4c97-85bd-f97992deb158-CREDIT",
          timeCreated: 1607872095423,
        },
      ],
    };

    nock(process.env.WALLET_SERVICE_URL)
      .get(`/transactions/${walletId}?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      .reply(BAD_REQUEST, mockResponse);

    try {
      await WalletService.walletTransactionsById({
        walletId,
        dateTo,
        dateFrom,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });
});
