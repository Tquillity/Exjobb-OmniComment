// smart-contracts/test/3-comments.test.js
const { setupTest, setupTestConstants, expect, time } = require("./shared/testSetup");

describe("3 - Comment Processing", function () {
    let contract, owner, user1, user2;
    const { COMMENT_COST, MONTHLY_SUB_COST, MONTHLY_DURATION, MIN_DEPOSIT, DAILY_DURATION, DAILY_SUB_COST } = setupTestConstants();

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

    it("Should allow comment with subscription near expiry", async function () {
        // Buy a short-term subscription, e.g., one day
        await contract.connect(user1).purchaseSubscription(
            DAILY_DURATION,
            ethers.ZeroAddress,
            { value: DAILY_SUB_COST }
        );
    
        // Move time to just before the subscription expires
        await time.increase(DAILY_DURATION - 60); // 60 seconds before expiry
    
        // Should still be allowed to comment
        await expect(
            contract.connect(owner).processCommentPayment(user1.address)
        ).to.not.be.reverted;
    });

    it("Should revert if subscription duration is not a multiple of DAILY_DURATION", async function () {
        // 12 hours in seconds:
        const halfDay = 12 * 60 * 60;
        
        await expect(
        contract.connect(user1).purchaseSubscription(
        halfDay, // Not a multiple of 24 hours
        ethers.ZeroAddress,
        { value: ethers.parseEther("1") }
        )
        ).to.be.revertedWithCustomError(contract, "InvalidDuration");
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

    it("Should allow comments with active subscription", async function () {
        // Purchase subscription
        await contract.connect(user1).purchaseSubscription(
            DAILY_DURATION,
            ethers.ZeroAddress,
            { value: DAILY_SUB_COST }
        );
        
        // Comment should work
        await expect(
            contract.connect(owner).processCommentPayment(user1.address)
        ).to.not.be.reverted;
    });

    it("Should reject comments with expired subscription and no deposit", async function () {
        // Purchase subscription
        await contract.connect(user1).purchaseSubscription(
            DAILY_DURATION,
            ethers.ZeroAddress,
            { value: DAILY_SUB_COST }
        );

        // Move time forward
        await time.increase(DAILY_DURATION + 1);

        // Comment should fail
        await expect(
            contract.connect(owner).processCommentPayment(user1.address)
        ).to.be.revertedWithCustomError(contract, "InsufficientBalance");
    });

    // Suppose DAILY_SUB_COST = 2 ETH
it("Should revert if duration is not a multiple of DAILY_DURATION but is ≥ 1 day", async function () {
    // 1.5 days
    const partialDay = 86400 + 43200; // 86400 * 1.5 = 129600
    
    // This will make _calculateSubscriptionCost() see daysCount=1
    // and return cost = DAILY_SUB_COST * 1 = 2 ETH
    const cost = ethers.parseEther("2"); // or dailySubCost if you have it in a variable
    
    await expect(
    contract.connect(user1).purchaseSubscription(
    partialDay,
    ethers.ZeroAddress,
    { value: cost }
    )
    ).to.be.revertedWithCustomError(contract, "InvalidDuration");
    });
});