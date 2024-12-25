// smart-contracts/test/6-daily-pass.test.js
const { setupTest, setupTestConstants, expect } = require("./shared/testSetup");

describe("6 - Daily Pass System", function () {
    let contract, owner, user1, user2;
    const { DAILY_SUB_COST, GIFTED_PASS_COST } = setupTestConstants();

    beforeEach(async function () {
        ({ contract, owner, user1, user2 } = await setupTest());
    });

    it("Should handle daily pass purchase correctly", async function () {
        const passCount = 5n;
        const totalCost = DAILY_SUB_COST * passCount;

        await expect(contract.connect(user1).purchaseDailyPasses(
            passCount,
            { value: totalCost }
        ))
        .to.emit(contract, "DailyPassPurchased")
        .withArgs(user1.address, passCount);

        const userInfo = await contract.getUserInfo(user1.address);
        expect(userInfo.dailyPasses).to.equal(passCount);
    });

    it("Should reject daily pass purchase with insufficient payment", async function () {
        const passCount = 5n;
        const insufficientCost = DAILY_SUB_COST * passCount / 2n;
        
        await expect(
            contract.connect(user1).purchaseDailyPasses(passCount, {
                value: insufficientCost
            })
        ).to.be.revertedWithCustomError(contract, "InsufficientPayment");
    });

    it("Should handle gifted daily passes correctly", async function () {
        const passCount = 3n;
        const totalCost = GIFTED_PASS_COST * passCount;

        await expect(contract.connect(user1).giftDailyPass(
            user2.address,
            passCount,
            { value: totalCost }
        ))
        .to.emit(contract, "DailyPassGifted")
        .withArgs(user1.address, user2.address, passCount);

        const recipientInfo = await contract.getUserInfo(user2.address);
        expect(recipientInfo.dailyPasses).to.equal(passCount);
    });

    it("Should extend passes expiry when adding more passes", async function () {
        const initialPasses = 2n;
        await contract.connect(user1).purchaseDailyPasses(
            initialPasses,
            { value: DAILY_SUB_COST * initialPasses }
        );

        const additionalPasses = 3n;
        await contract.connect(user1).purchaseDailyPasses(
            additionalPasses,
            { value: DAILY_SUB_COST * additionalPasses }
        );

        const userInfo = await contract.getUserInfo(user1.address);
        expect(userInfo.dailyPasses).to.equal(initialPasses + additionalPasses);
    });
});