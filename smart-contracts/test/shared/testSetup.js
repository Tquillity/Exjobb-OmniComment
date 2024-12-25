// smart-contracts/test/shared/testSetup.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Constants shared across test files
const setupTestConstants = () => ({
    COMMENT_COST: ethers.parseEther("0.05"),
    DAILY_SUB_COST: ethers.parseEther("2"),
    MONTHLY_SUB_COST: ethers.parseEther("40"),
    YEARLY_SUB_COST: ethers.parseEther("400"),
    MIN_DEPOSIT: ethers.parseEther("1"),
    REFERRAL_COMMISSION: 75,
    GIFTED_PASS_COST: ethers.parseEther("1.5"),
    DAILY_DURATION: 24 * 60 * 60,
    MONTHLY_DURATION: 30 * 24 * 60 * 60,
    YEARLY_DURATION: 365 * 24 * 60 * 60
});

// Common setup for all test files
const setupTest = async () => {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("OmniCommentPayment");
    const contract = await Contract.deploy();
    return { contract, owner, user1, user2, user3 };
};

module.exports = {
    setupTest,
    setupTestConstants,
    expect,
    time
};