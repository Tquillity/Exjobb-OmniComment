// smart-contracts/test/OmniComment.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("OmniCommentPayment", function () {
    let contract;
    let owner;
    let user1;
    let user2;
    let user3;
    
    // Constants matching the contract
    const COMMENT_COST = ethers.parseEther("0.05");
    const DAILY_SUB_COST = ethers.parseEther("2");
    const MONTHLY_SUB_COST = ethers.parseEther("40");
    const YEARLY_SUB_COST = ethers.parseEther("400");
    const MIN_DEPOSIT = ethers.parseEther("1");
    const REFERRAL_COMMISSION = 75; // 7.5%

    const DAILY_DURATION = 24 * 60 * 60; // 1 day in seconds
    const MONTHLY_DURATION = 30 * 24 * 60 * 60;
    const YEARLY_DURATION = 365 * 24 * 60 * 60;

    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();
        const Contract = await ethers.getContractFactory("OmniCommentPayment");
        contract = await Contract.deploy();
    });

    describe("Deposit System", function () {
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
            ).to.be.revertedWith("Deposit below minimum");
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
            ).to.be.revertedWith("Insufficient balance");
        });
    });

    describe("Subscription System", function () {
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
            ).to.be.revertedWith("Invalid duration");
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

    describe("Comment Processing", function () {
        it("Should allow free comments for subscribers", async function () {
            // Purchase subscription
            await contract.connect(user1).purchaseSubscription(
                MONTHLY_DURATION,
                ethers.ZeroAddress,
                { value: MONTHLY_SUB_COST }
            );

            // Process comment should not deduct any balance
            await contract.connect(owner).processCommentPayment(user1.address);
            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.depositBalance).to.equal(0); // No deposit used
        });

        it("Should deduct from deposit for non-subscribers", async function () {
            // Make deposit
            await contract.connect(user1).deposit({ value: MIN_DEPOSIT });
            
            // Process comment
            await contract.connect(owner).processCommentPayment(user1.address);
            
            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.depositBalance).to.equal(MIN_DEPOSIT - COMMENT_COST);
        });

        it("Should prevent comments without sufficient funds", async function () {
            await expect(
                contract.connect(owner).processCommentPayment(user1.address)
            ).to.be.revertedWith("User cannot comment");
        });

        it("Should only allow owner or contract to process comments", async function () {
            await expect(
                contract.connect(user2).processCommentPayment(user1.address)
            ).to.be.revertedWith("Unauthorized");
        });
    });

    describe("Referral System", function () {
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
            // First subscription with referral
            await contract.connect(user1).purchaseSubscription(
                MONTHLY_DURATION,
                user2.address,
                { value: MONTHLY_SUB_COST }
            );

            const referrerInitialBalance = await ethers.provider.getBalance(user2.address);

            // Second subscription should not pay referral
            await contract.connect(user1).purchaseSubscription(
                MONTHLY_DURATION,
                user2.address,
                { value: MONTHLY_SUB_COST }
            );

            const referrerFinalBalance = await ethers.provider.getBalance(user2.address);
            expect(referrerFinalBalance).to.equal(referrerInitialBalance);
        });
    });

    describe("Admin Functions", function () {
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
            // Purchase subscription to add funds
            await contract.connect(user1).purchaseSubscription(
                MONTHLY_DURATION,
                ethers.ZeroAddress,
                { value: MONTHLY_SUB_COST }
            );

            // Make deposit to create protected balance
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
            const contractBalance = await ethers.provider.getBalance(contract.target);
            
            // Try to withdraw everything
            await expect(
                contract.connect(owner).withdrawFunds()
            ).to.be.revertedWith("No balance to withdraw");

            // User should still be able to withdraw their deposit
            await expect(contract.connect(user1).withdraw(MIN_DEPOSIT))
                .to.emit(contract, "Withdrawal")
                .withArgs(user1.address, MIN_DEPOSIT);
        });
    });

    describe("Subscription Expiry", function () {
        it("Should correctly track subscription expiry", async function () {
            await contract.connect(user1).purchaseSubscription(
                MONTHLY_DURATION,
                ethers.ZeroAddress,
                { value: MONTHLY_SUB_COST }
            );

            // Fast forward to just before expiry
            await time.increase(MONTHLY_DURATION - 60); // 1 minute before expiry
            expect(await contract.canComment(user1.address)).to.be.true;

            // Fast forward past expiry
            await time.increase(120); // 2 minutes later
            const userInfo = await contract.getUserInfo(user1.address);
            expect(await contract.canComment(user1.address)).to.be.false;
        });

        it("Should stack subscription durations", async function () {
            // Purchase initial subscription
            await contract.connect(user1).purchaseSubscription(
                MONTHLY_DURATION,
                ethers.ZeroAddress,
                { value: MONTHLY_SUB_COST }
            );

            // Fast forward halfway through
            await time.increase(MONTHLY_DURATION / 2);

            // Purchase additional subscription
            await contract.connect(user1).purchaseSubscription(
                MONTHLY_DURATION,
                ethers.ZeroAddress,
                { value: MONTHLY_SUB_COST }
            );

            // Fast forward past first subscription period
            await time.increase(MONTHLY_DURATION);

            // Should still be active
            expect(await contract.canComment(user1.address)).to.be.true;
        });
    });
});