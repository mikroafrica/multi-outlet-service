import { describe, it } from "mocha";
import "chai/register-should";

describe("mikro-multi-outlet service test", () => {
  it("should work pretty fine", () => {
    const sum = (a: number, b: number) => a + b;
    sum(5, 6).should.equal(11);
  });
});
