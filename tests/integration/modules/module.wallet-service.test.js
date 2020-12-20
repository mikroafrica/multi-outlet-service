import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { describe, it } from "mocha";
import * as WalletService from "../../../src/api/modules/wallet-service";
import nock from "nock";
import { OK } from "../../../src/api/modules/status";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Wallet service module Tests", function () {
  it("should successfully get wallet by id", async function () {
    const walletId = "c2dbe9a6-42ce-11eb-b378-0242ac130002";

    const mockResponse = {
      status: true,
      data: {
        id: "f1ef2-6a56-441-a389-e06b10c",
        balance: 10,
        totalCredit: 20,
        totalDebit: 10,
        numberOfTransaction: 2,
        currency: "NGN",
        timeCreated: 1607408981460,
      },
    };

    nock(process.env.WALLET_SERVICE_URL)
      .get(`/wallets/${walletId}`)
      .reply(OK, mockResponse);

    const response = await WalletService.getWalletById(walletId);
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully fetch wallet summary by wallet Id", async function () {
    const walletId = "c2dbecc6-42ce-11eb-b378-0242ac130002";
    const dateFrom = 2000001479;

    const mockResponse = {
      status: true,
      data: {
        id: "f1ef2-6a56-441-a389-e06b10c",
        balance: 10,
        totalCredit: 20,
        totalDebit: 10,
        numberOfTransaction: 2,
        currency: "NGN",
        timeCreated: 1607408981460,
      },
    };

    nock(process.env.WALLET_SERVICE_URL)
      .get(`/transactions/${walletId}/balance?dateFrom=${dateFrom}`)
      .reply(OK, mockResponse);

    const response = await WalletService.fetchWalletSummaryById({
      walletId,
      dateFrom,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully fetch wallet transactions by wallet Id", async function () {
    const walletId = "c2dbee60-42ce-11eb-b378-0242ac130002";
    const dateFrom = 200000;
    const dateTo = 1574835;

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

    const response = await WalletService.fetchWalletTransactions({
      walletId,
      dateFrom,
      dateTo,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });
});
