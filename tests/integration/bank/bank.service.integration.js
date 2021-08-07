import { describe, it } from "mocha";
import nock from "nock";
import { OK } from "../../../src/api/modules/status";
import * as BankService from "../../../src/api/resources/bank/bank.service";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Outlet service Tests", function () {
  it("should successfully fetch beneficiary accounts", async function () {
    const userId = "bvjqhkxjuq";

    nock(process.env.CONSUMER_SERVICE_URL)
      .get(`/user/${userId}/personal-account`)
      .reply(OK, {
        statusCode: OK,
        data: {
          canCreate: true,
          accounts: [],
        },
      });

    const response = await BankService.fetchCreatedBankAccounts({ userId });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });

  it("should successfully create beneficiary bank account", async function () {
    const userId = "bvjqhkxjuq";

    const params = {
      bankName: "GTB",
      bankCode: "0344",
      accountNumber: "343564356486",
      accountName: "Account Name",
    };

    nock(process.env.CONSUMER_SERVICE_URL)
      .post(`/user/${userId}/personal-account`)
      .reply(OK, {
        statusCode: OK,
        data: {
          bankName: "name",
          bankCode: "0123",
          accountNumber: "1234567890",
          accountName: "account name",
        },
      });

    const response = await BankService.createPersonalBankAccount({
      userId,
      params,
    });
    expect(response.statusCode).equals(OK);
    expect(response.data).to.exist;
  });
});
