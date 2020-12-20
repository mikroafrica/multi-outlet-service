import { describe, it } from "mocha";
import * as TransferService from "../../../src/api/resources/transfer/transfer.service";

describe("Owner service Tests", function () {
  it("should transfer between two wallets", async function () {
    const ownerId = "a0558f24c432c";
    const outletId = "b2453a34c432c";

    const response = TransferService.walletTransfer({});
  });

  it("should fail to transfer if the destination supplied is wrong", async function () {});

  it("should fail to transfer between two wallets if balance is not sufficient", async function () {});
});
