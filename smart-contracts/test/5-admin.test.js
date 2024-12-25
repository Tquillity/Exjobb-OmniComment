// smart-contracts/test/5-admin.test.js
const { setupTest, setupTestConstants, expect } = require("./shared/testSetup");

describe("5 - Admin Functions", function () {
    let contract, owner, user1, user2;
    const { MONTHLY_SUB_COST, MONTHLY_DURATION, MIN_DEPOSIT } = setupTestConstants();

    beforeEach(async function () {
        ({ contract, owner, user1, user2 } = await setupTest());
    });

    it("Should allow pausing and unpausing by owner", async function () {
        await contract.connect(owner).pause();
        
        await expect(
            contract.connect(user1).deposit({ value: MIN_DEPOSIT })
        ).to.be.reverted;

        await contract.connect(owner).unpause();
        
        await expect(contract.connect(user1).deposit({ value: MIN_DEPOSIT }))
            .to.emit(contract, "Deposit");
    });

    it("Should prevent non-owners from pausing", async function () {
        await expect(
            contract.connect(user1).pause()
        ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw excess funds", async function () {
        await contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            ethers.ZeroAddress,
            { value: MONTHLY_SUB_COST }
        );

        await contract.connect(user2).deposit({ value: MIN_DEPOSIT });

        const initialBalance = await ethers.provider.getBalance(owner.address);
        const tx = await contract.connect(owner).withdrawFunds();
        const receipt = await tx.wait();
        const gasCost = receipt.gasUsed * receipt.gasPrice;

        const finalBalance = await ethers.provider.getBalance(owner.address);
        expect(finalBalance + gasCost - initialBalance).to.equal(MONTHLY_SUB_COST);
    });

    it("Should protect user deposits during withdrawal", async function () {
        await contract.connect(user1).deposit({ value: MIN_DEPOSIT });
        await expect(
            contract.connect(owner).withdrawFunds()
        ).to.be.revertedWithCustomError(contract, "InsufficientBalance");
    });
});