// smart-contracts/test/4-referral.test.js
const { setupTest, setupTestConstants, expect } = require("./shared/testSetup");

describe("4 - Referral System", function () {
    let contract, owner, user1, user2;
    const { MONTHLY_SUB_COST, MONTHLY_DURATION, REFERRAL_COMMISSION } = setupTestConstants();

    beforeEach(async function () {
        ({ contract, owner, user1, user2 } = await setupTest());
    });

    it("Should register referral and pay commission", async function () {
        const referrerInitialBalance = await ethers.provider.getBalance(user2.address);
        
        await contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            user2.address,
            { value: MONTHLY_SUB_COST }
        );

        const referrerFinalBalance = await ethers.provider.getBalance(user2.address);
        const expectedCommission = (MONTHLY_SUB_COST * BigInt(REFERRAL_COMMISSION)) / 1000n;
        
        expect(referrerFinalBalance - referrerInitialBalance).to.equal(expectedCommission);
    });

    it("Should only register referral once per user", async function () {
        await contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            user2.address,
            { value: MONTHLY_SUB_COST }
        );

        const referrerInitialBalance = await ethers.provider.getBalance(user2.address);

        await contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            user2.address,
            { value: MONTHLY_SUB_COST }
        );

        const referrerFinalBalance = await ethers.provider.getBalance(user2.address);
        expect(referrerFinalBalance).to.equal(referrerInitialBalance);
    });
});