// smart-contracts/test/3-comments.test.js
const { setupTest, setupTestConstants, expect } = require("./shared/testSetup");

describe("3 - Comment Processing", function () {
    let contract, owner, user1, user2;
    const { COMMENT_COST, MONTHLY_SUB_COST, MONTHLY_DURATION, MIN_DEPOSIT } = setupTestConstants();

    beforeEach(async function () {
        ({ contract, owner, user1, user2 } = await setupTest());
    });

    it("Should allow free comments for subscribers", async function () {
        await contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            ethers.ZeroAddress,
            { value: MONTHLY_SUB_COST }
        );

        await contract.connect(owner).processCommentPayment(user1.address);
        const userInfo = await contract.getUserInfo(user1.address);
        expect(userInfo.depositBalance).to.equal(0);
    });

    it("Should deduct from deposit for non-subscribers", async function () {
        await contract.connect(user1).deposit({ value: MIN_DEPOSIT });
        await contract.connect(owner).processCommentPayment(user1.address);
        
        const userInfo = await contract.getUserInfo(user1.address);
        expect(userInfo.depositBalance).to.equal(MIN_DEPOSIT - COMMENT_COST);
    });

    it("Should prevent comments without sufficient funds", async function () {
        await expect(
            contract.connect(owner).processCommentPayment(user1.address)
        ).to.be.revertedWithCustomError(contract, "InsufficientBalance");
    });

    it("Should only allow owner or contract to process comments", async function () {
        await expect(
            contract.connect(user2).processCommentPayment(user1.address)
        ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });
});