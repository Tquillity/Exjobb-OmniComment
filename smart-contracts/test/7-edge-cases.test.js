// smart-contracts/test/7-edge-cases-test.js
const { setupTest, setupTestConstants, expect, time } = require("./shared/testSetup");

describe("7 - Edge Cases and Error Handling", function () {
    let contract, owner, user1, user2, user3;
    const { 
        MONTHLY_SUB_COST, 
        MONTHLY_DURATION,
        YEARLY_SUB_COST,
        YEARLY_DURATION 
    } = setupTestConstants();

    beforeEach(async function () {
        ({ contract, owner, user1, user2, user3 } = await setupTest());
    });

    it("Should handle subscription purchase with exact payment", async function () {
        await expect(contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            ethers.ZeroAddress,
            { value: MONTHLY_SUB_COST }
        )).to.not.be.reverted;
    });

    it("Should handle zero address checks for gifting", async function () {
        await expect(
            contract.connect(user1).giftSubscription(
                ethers.ZeroAddress,
                MONTHLY_DURATION,
                { value: MONTHLY_SUB_COST }
            )
        ).to.be.revertedWithCustomError(contract, "InvalidRecipient");
    });

    it("Should correctly process referral for first-time user only", async function () {
        await contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            user2.address,
            { value: MONTHLY_SUB_COST }
        );

        const userInfo = await contract.getUserInfo(user1.address);
        expect(userInfo.hasReferrer).to.be.true;

        await contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            user3.address,
            { value: MONTHLY_SUB_COST }
        );

        const updatedInfo = await contract.getUserInfo(user1.address);
        expect(updatedInfo.hasReferrer).to.be.true;
    });

    it("Should handle subscription stacking at max duration", async function () {
        const currentTime = (await time.latest());
        
        await contract.connect(user1).purchaseSubscription(
            YEARLY_DURATION,
            ethers.ZeroAddress,
            { value: YEARLY_SUB_COST }
        );
        
        await contract.connect(user1).purchaseSubscription(
            YEARLY_DURATION,
            ethers.ZeroAddress,
            { value: YEARLY_SUB_COST }
        );
        
        const userInfo = await contract.getUserInfo(user1.address);
        expect(userInfo.subscriptionExpiry).to.be.gt(
            BigInt(currentTime) + BigInt(YEARLY_DURATION)
        );
    });
});