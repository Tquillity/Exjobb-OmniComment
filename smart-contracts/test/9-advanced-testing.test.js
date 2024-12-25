// smart-contracts/test/9-advanced-testing.test.js
const { setupTest, setupTestConstants, expect } = require("./shared/testSetup");

describe("9 - Fuzz Testing - Payment Values", function () {
  let contract, owner, user1;
  const { MIN_DEPOSIT } = setupTestConstants();

  beforeEach(async function () {
      ({ contract, owner, user1 } = await setupTest());
  });

  it("Should handle arbitrary payment amounts", async function () {
      const testValues = Array.from({length: 10}, () => 
          MIN_DEPOSIT + ethers.parseEther((Math.random() * 10).toFixed(18))
      );

      for (const value of testValues) {
          await expect(
              contract.connect(user1).deposit({ value })
          ).to.emit(contract, "Deposit").withArgs(user1.address, value);
      }
  });
});