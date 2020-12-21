import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { describe, it } from "mocha";
import * as TransactionService from "../../../src/api/modules/transaction-service";
import nock from "nock";
import { OK } from "../../../src/api/modules/status";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Transaction service module Tests", function () {
  it("should successfully fetch transactions", async function () {
    const userId = "c2dbecc6-42ce-11eb-b378-0242ac130002";
    const dateFrom = 2000001479;
    const dateTo = 200365854034;

    const mockResponse = {
      status: true,
      data: {
        page: 1,
        limit: 20,
        total: 946,
        list: [
          {
            id: "9eb2856f-86ed-4698-9d99-f03a3e24df9c",
            amount: 25,
            userId: null,
            transactionReference: "WDL-adbb5034-eeca-4bd6-b00c-ebf74cef6c76",
            transactionStatus: "payment failed",
            transactionType: "withdrawal",
            user: "1010101 (POS)",
            product: "POS Withdrawal",
            timeCreated: 1607857173009,
          },
          {
            id: "59bba7fd-f07e-42cf-b700-c72f4ccecc82",
            amount: 250,
            userId: null,
            transactionReference: "WDL-05f9cdd8-65af-4c97-85bd-f97992deb158",
            transactionStatus: "successful",
            transactionType: "withdrawal",
            user: "1010101 (POS)",
            product: "POS Withdrawal",
            timeCreated: 1607856840220,
          },
        ],
      },
    };

    nock(process.env.TRANSACTION_SERVICE_URL)
      .get(`/transactions/${userId}?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      .reply(OK, mockResponse);

    const response = await TransactionService.fetchTransactions({
      userId,
      dateFrom,
      dateTo,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully fetch transaction summary", async function () {
    const userId = "c2dbe9a6-42ce-11eb-b378-0242ac130002";
    const dateFrom = 2000001479;
    const dateTo = 200365854034;

    const mockResponse = {
      status: true,
      data: [
        {
          type: "PHCN",
          success: 10,
          failed: 1,
          pending: 3,
        },
        {
          type: "P2P",
          success: 20,
          failed: 3,
          pending: 5,
        },
      ],
    };

    nock(process.env.TRANSACTION_SERVICE_URL)
      .get(
        `/transactions/summary?dateFrom=${dateFrom}&dateTo=${dateTo}&userId=${userId}`
      )
      .reply(OK, mockResponse);

    const response = await TransactionService.fetchTransactionSummary({
      userId,
      dateFrom,
      dateTo,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully create a transaction", async function () {
    const params = {
      amount: 20000,
      transactionType: "P2P",
      uniqueIdentifier: "68eb960e-42d2-11eb-b378-0242ac130002",
    };

    const mockResponse = {
      status: true,
      data: {
        status: true,
        data: {
          id: "b4c5011a-b503-4bba-ab6e-c9a7c8f6122f",
          amount: 100,
          userId: "5fd35d158677251eabdf8ef5",
          transactionReference: "P2P-718173f7-a730-4ea2-abb7-a5f048ea3727",
          transactionStatus: "successful",
          transactionType: "p2p",
          user: "meshileya seun",
          product: null,
          timeCreated: 1608394276296,
        },
      },
    };

    nock(process.env.TRANSACTION_SERVICE_URL)
      .post(`/transactions/create`)
      .reply(OK, mockResponse);

    const response = await TransactionService.creteTransaction(params);
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });
});
