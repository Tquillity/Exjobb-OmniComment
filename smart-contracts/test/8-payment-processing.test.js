// smart-contracts/test/8-payment-processing.test.js
const { setupTest, setupTestConstants, expect } = require("./shared/testSetup");
const { ethers } = require("hardhat");

describe("8 - Payment Processing", function () {
    let contract, owner, user1, user2;
    const { 
        MONTHLY_SUB_COST, 
        MONTHLY_DURATION,
        DAILY_SUB_COST 
    } = setupTestConstants();

    beforeEach(async function () {
        ({ contract, owner, user1, user2 } = await setupTest());
    });

    it("Should reject excess payments", async function () {
        const excess = ethers.parseEther("1.0");
        await expect(
            contract.connect(user1).purchaseSubscription(
                MONTHLY_DURATION,
                ethers.ZeroAddress,
                { value: MONTHLY_SUB_COST + excess }
            )
        ).to.be.revertedWithCustomError(contract, "InsufficientPayment");
    });

    it("Should revert on failed referral payments", async function () {
        const MockFailingWallet = await ethers.getContractFactory("MockFailingWallet");
        const mockWallet = await MockFailingWallet.deploy();
        
        await expect(
            contract.connect(user1).purchaseSubscription(
                MONTHLY_DURATION,
                await mockWallet.getAddress(),
                { value: MONTHLY_SUB_COST }
            )
        ).to.be.revertedWithCustomError(contract, "TransactionFailed");
    });

    it("Should handle successful referral payments", async function () {
        // First user makes purchase with referrer
        await contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            user2.address,  // Regular wallet address as referrer
            { value: MONTHLY_SUB_COST }
        );
    
        // Check referral was processed
        const userInfo = await contract.getUserInfo(user1.address);
        expect(userInfo.hasReferrer).to.be.true;
    });

    it("Should handle zero address referrer", async function () {
        await contract.connect(user1).purchaseSubscription(
            MONTHLY_DURATION,
            ethers.ZeroAddress,
            { value: MONTHLY_SUB_COST }
        );
        
        const userInfo = await contract.getUserInfo(user1.address);
        expect(userInfo.hasReferrer).to.be.false;
    });

    it("Should handle multiple daily pass purchases with referrals", async function () {
        const passCount1 = 5n;
        const passCount2 = 3n;
        
        await contract.connect(user1).purchaseDailyPasses(
            passCount1,
            { value: DAILY_SUB_COST * passCount1 }
        );
        
        const referrerBalance = await ethers.provider.getBalance(user2.address);
        
        await contract.connect(user1).purchaseDailyPasses(
            passCount2,
            { value: DAILY_SUB_COST * passCount2 }
        );
        
        const newBalance = await ethers.provider.getBalance(user2.address);
        expect(newBalance).to.equal(referrerBalance);
    });

    it("Should handle payment refund failure", async function () {
      const MockFailingWallet = await ethers.getContractFactory("MockFailingWallet");
      const mockWallet = await MockFailingWallet.deploy();
  
      await expect(
          contract.connect(user1).purchaseSubscription(
              MONTHLY_DURATION,
              await mockWallet.getAddress(),
              { value: MONTHLY_SUB_COST + ethers.parseEther("1.0") }
          )
      ).to.be.revertedWithCustomError(contract, "InsufficientPayment");
  
      // Verify the contract retains the full amount
      const contractBalance = await ethers.provider.getBalance(await contract.getAddress());
      expect(contractBalance).to.equal(0n);
  });
});

describe("8 - Edge Cases - Payment Processing", function () {
  let contract, owner, user1;
  const { MONTHLY_SUB_COST, MONTHLY_DURATION } = setupTestConstants();

  beforeEach(async function () {
      ({ contract, owner, user1 } = await setupTest());
  });

  it("Should handle silent failures in receive function", async function () {
      const MockFailingWallet = await ethers.getContractFactory("MockFailingWallet");
      const mockWallet = await MockFailingWallet.deploy();
      
      await expect(
          contract.connect(user1).purchaseSubscription(
              MONTHLY_DURATION,
              await mockWallet.getAddress(),
              { value: MONTHLY_SUB_COST }
          )
      ).to.be.revertedWithCustomError(contract, "TransactionFailed");
  });

  it("Should validate subscription duration boundaries", async function () {
      await expect(
          contract.connect(user1).purchaseSubscription(
              0,
              ethers.ZeroAddress,
              { value: MONTHLY_SUB_COST }
          )
      ).to.be.revertedWithCustomError(contract, "InvalidDuration");
  });
});