// smart-contracts/test/2-subscription.test.js
const { setupTest, setupTestConstants, expect, time } = require("./shared/testSetup");

describe("2 - Subscription System", function () {
  let contract, owner, user1, user2;
  const {
    MONTHLY_SUB_COST,
    YEARLY_SUB_COST,
    DAILY_SUB_COST,
    DAILY_DURATION,
    MONTHLY_DURATION,
    YEARLY_DURATION
  } = setupTestConstants();

  beforeEach(async function () {
    ({ contract, owner, user1, user2 } = await setupTest());
  });

  it("Should handle daily subscription purchase", async function () {
    const days = 5;
    const duration = days * DAILY_DURATION;
    const cost = DAILY_SUB_COST * BigInt(days);

    await expect(contract.connect(user1).purchaseSubscription(
      duration,
      ethers.ZeroAddress,
      { value: cost }
    ))
      .to.emit(contract, "SubscriptionPurchased")
      .withArgs(user1.address, duration);

    const userInfo = await contract.getUserInfo(user1.address);
    expect(userInfo.hasSubscription).to.be.true;
  });

  it("Should enforce maximum daily subscription limit", async function () {
    const days = 21; // Above MAX_DAILY_COUNT
    const duration = days * DAILY_DURATION;
    const cost = DAILY_SUB_COST * BigInt(days);

    await expect(
      contract.connect(user1).purchaseSubscription(
        duration,
        ethers.ZeroAddress,
        { value: cost }
      )
    ).to.be.revertedWithCustomError(contract, "InvalidDuration");
  });

  it("Should handle monthly subscription purchase", async function () {
    await expect(contract.connect(user1).purchaseSubscription(
      MONTHLY_DURATION,
      ethers.ZeroAddress,
      { value: MONTHLY_SUB_COST }
    ))
      .to.emit(contract, "SubscriptionPurchased")
      .withArgs(user1.address, MONTHLY_DURATION);
  });

  it("Should handle yearly subscription purchase", async function () {
    await expect(contract.connect(user1).purchaseSubscription(
      YEARLY_DURATION,
      ethers.ZeroAddress,
      { value: YEARLY_SUB_COST }
    ))
      .to.emit(contract, "SubscriptionPurchased")
      .withArgs(user1.address, YEARLY_DURATION);
  });

  it("Should allow gifting subscriptions", async function () {
    const days = 5;
    const duration = days * DAILY_DURATION;
    const cost = DAILY_SUB_COST * BigInt(days);

    await expect(contract.connect(user1).giftSubscription(
      user2.address,
      duration,
      { value: cost }
    ))
      .to.emit(contract, "SubscriptionPurchased")
      .withArgs(user2.address, duration);

    const userInfo = await contract.getUserInfo(user2.address);
    expect(userInfo.hasSubscription).to.be.true;
  });
});