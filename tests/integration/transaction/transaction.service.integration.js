import { describe, it } from "mocha";
import nock from "nock";
import chai from "chai";
import sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import * as TransactionService from "../../../src/api/resources/transaction/transaction.service";
import {
  BAD_REQUEST,
  FORBIDDEN,
  OK,
  UN_AUTHORISED,
} from "../../../src/api/modules/status";
import { Outlet } from "../../../src/api/resources/outlet/outlet.model";
import { Verification } from "../../../src/api/resources/outlet/verification.model";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Transaction service Tests", function () {
  it("should successfully fetch an outlet transactions", async function () {
    const outletId = "c2dbe9a6-42ce-11eb-b378-0242ac130002";
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
      .get(`/transactions/${outletId}?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      .reply(OK, mockResponse);

    const response = await TransactionService.fetchOutletTransactions({
      outletId,
      dateFrom,
      dateTo,
    });

    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should fail to fetch outlet transactions if transaction service returns an error", async function () {
    const outletId = "c2dbe9a6-42ce-11eb-b378-0242ac130002";
    const dateFrom = 2000001479;
    const dateTo = 200365854034;

    const mockResponse = {
      status: false,
      message: "Could not fetch outlet transactions",
    };

    nock(process.env.TRANSACTION_SERVICE_URL)
      .get(`/transactions/${outletId}?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      .reply(BAD_REQUEST, mockResponse);

    try {
      await TransactionService.fetchOutletTransactions({
        outletId,
        dateFrom,
        dateTo,
      });
    } catch (err) {
      expect(err.statusCode).equals(BAD_REQUEST);
      expect(err.message).to.exist;
    }
  });
});
