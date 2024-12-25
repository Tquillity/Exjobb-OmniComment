// smart-contracts/test/1-deposit.test.js
const { setupTest, setupTestConstants, expect } = require("./shared/testSetup");

describe("1 - Deposit System", function () {
  let contract, owner, user1, user2;
  const { MIN_DEPOSIT } = setupTestConstants();

  beforeEach(async function () {
    ({ contract, owner, user1, user2 } = await setupTest());
  });

  it("Should accept deposits above minimum", async function () {
    await expect(contract.connect(user1).deposit({
      value: MIN_DEPOSIT
    }))
      .to.emit(contract, "Deposit")
      .withArgs(user1.address, MIN_DEPOSIT);

    const userInfo = await contract.getUserInfo(user1.address);
    expect(userInfo.depositBalance).to.equal(MIN_DEPOSIT);
  });

  it("Should reject deposits below minimum", async function () {
    await expect(
      contract.connect(user1).deposit({
        value: MIN_DEPOSIT / 2n
      })
    ).to.be.revertedWithCustomError(contract, "InsufficientPayment");
  });

  it("Should track total deposits correctly", async function () {
    await contract.connect(user1).deposit({ value: MIN_DEPOSIT });
    await contract.connect(user2).deposit({ value: MIN_DEPOSIT * 2n });

    const totalDeposits = await contract.totalDeposits();
    expect(totalDeposits).to.equal(MIN_DEPOSIT * 3n);
  });

  it("Should allow partial withdrawals", async function () {
    await contract.connect(user1).deposit({ value: MIN_DEPOSIT * 2n });
    await contract.connect(user1).withdraw(MIN_DEPOSIT);

    const userInfo = await contract.getUserInfo(user1.address);
    expect(userInfo.depositBalance).to.equal(MIN_DEPOSIT);
  });

  it("Should prevent withdrawing more than deposited", async function () {
    await contract.connect(user1).deposit({ value: MIN_DEPOSIT });
    await expect(
      contract.connect(user1).withdraw(MIN_DEPOSIT * 2n)
    ).to.be.revertedWithCustomError(contract, "InsufficientBalance");
  });
});