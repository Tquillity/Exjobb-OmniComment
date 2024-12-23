// smart-contracts/contracts/OmniComment.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title OmniCommentPayment
 * @notice Handles payment logic for comments and subscriptions with deposit pool functionality
 */
contract OmniCommentPayment is Ownable, ReentrancyGuard, Pausable {
    // Constants for pricing
    uint256 public constant COMMENT_COST = 0.05 ether;     // 0.05 POL
    uint256 public constant DAILY_SUB_COST = 2 ether;      // 2 POL per day
    uint256 public constant MONTHLY_SUB_COST = 40 ether;   // 40 POL (~33% discount)
    uint256 public constant YEARLY_SUB_COST = 400 ether;   // 400 POL (~45% discount)
    uint256 public constant MIN_DEPOSIT = 1 ether;         // 1 POL
    uint256 public constant MAX_DAILY_COUNT = 20;          // Maximum days for daily subscription
    uint256 public constant REFERRAL_COMMISSION = 75;      // 7.5% (75/1000)
    uint256 public constant GIFTED_PASS_COST = 1.5 ether;  // 1.5 POL (25% discount)

    // Time constants
    uint256 public constant DAILY_DURATION = 1 days;
    uint256 public constant MONTHLY_DURATION = 30 days;
    uint256 public constant YEARLY_DURATION = 365 days;

    struct UserInfo {
        uint256 depositBalance;      // User's available deposit for comments
        uint256 subscriptionExpiry;  // Timestamp when subscription expires
        bool hasSubscription;        // Whether user has an active subscription
        uint256 dailyPasses;        // Number of daily passes available
        uint256 passesExpiry;       // Timestamp when passes expire
    }

    // State variables
    mapping(address => UserInfo) public users;
    mapping(address => address) public referrers;
    uint256 public totalDeposits;

    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event CommentPaid(address indexed user, uint256 cost);
    event SubscriptionPurchased(address indexed user, uint256 duration);
    event DailyPassPurchased(address indexed user, uint256 count);
    event DailyPassGifted(address indexed from, address indexed to, uint256 count);
    event ReferralRegistered(address indexed referrer, address indexed referee);
    event ReferralPaid(address indexed referrer, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Deposit functions
    function deposit() external payable whenNotPaused {
        require(msg.value >= MIN_DEPOSIT, "Deposit below minimum");
        users[msg.sender].depositBalance += msg.value;
        totalDeposits += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount <= users[msg.sender].depositBalance, "Insufficient balance");
        users[msg.sender].depositBalance -= amount;
        totalDeposits -= amount;
        (bool sent,) = msg.sender.call{value: amount}("");
        require(sent, "Withdrawal failed");
        emit Withdrawal(msg.sender, amount);
    }

    // Comment payment function - only callable by backend
    function processCommentPayment(address user) external whenNotPaused {
        require(
            msg.sender == owner() || msg.sender == address(this),
            "Unauthorized"
        );
        
        if (!canComment(user)) {
            revert("User cannot comment");
        }

        // If user has an active subscription (any type), they can comment for free
        UserInfo storage info = users[user];
        if (info.hasSubscription && info.subscriptionExpiry > block.timestamp) {
            return;
        }

        // Otherwise, deduct from deposit balance
        require(info.depositBalance >= COMMENT_COST, "Insufficient deposit");
        info.depositBalance -= COMMENT_COST;
        totalDeposits -= COMMENT_COST;
        emit CommentPaid(user, COMMENT_COST);
    }

    // Subscription purchase
    function purchaseSubscription(uint256 duration, address referrer) external payable nonReentrant whenNotPaused {
        uint256 cost;
        
        // Calculate cost based on duration
        if (duration == YEARLY_DURATION) {
            cost = YEARLY_SUB_COST;
        } else if (duration == MONTHLY_DURATION) {
            cost = MONTHLY_SUB_COST;
        } else {
            // Convert duration to days
            uint256 dayCount = duration / DAILY_DURATION;
            require(dayCount > 0 && dayCount <= MAX_DAILY_COUNT, "Invalid duration");
            cost = DAILY_SUB_COST * dayCount;
        }

        require(msg.value >= cost, "Insufficient payment");

        // Handle referral
        if (referrer != address(0) && referrers[msg.sender] == address(0)) {
            referrers[msg.sender] = referrer;
            uint256 commission = (msg.value * REFERRAL_COMMISSION) / 1000;
            (bool sent,) = referrer.call{value: commission}("");
            if (sent) {
                emit ReferralPaid(referrer, commission);
            }
            emit ReferralRegistered(referrer, msg.sender);
        }

        // Update subscription - stack duration if already subscribed
        UserInfo storage info = users[msg.sender];
        if (info.hasSubscription && info.subscriptionExpiry > block.timestamp) {
            info.subscriptionExpiry += duration;  // Add to existing duration
        } else {
            info.subscriptionExpiry = block.timestamp + duration;  // Start new subscription
            info.hasSubscription = true;
        }
        emit SubscriptionPurchased(msg.sender, duration);
    }

    // Gift subscription
    function giftSubscription(address to, uint256 duration) external payable nonReentrant whenNotPaused {
        require(to != address(0), "Invalid recipient");
        uint256 cost;
        
        // Calculate cost based on duration
        if (duration == YEARLY_DURATION) {
            cost = YEARLY_SUB_COST;
        } else if (duration == MONTHLY_DURATION) {
            cost = MONTHLY_SUB_COST;
        } else {
            // Convert duration to days
            uint256 dayCount = duration / DAILY_DURATION;
            require(dayCount > 0 && dayCount <= MAX_DAILY_COUNT, "Invalid duration");
            cost = DAILY_SUB_COST * dayCount;
        }

        require(msg.value >= cost, "Insufficient payment");

        // Update recipient's subscription - stack duration if already subscribed
        UserInfo storage info = users[to];
        if (info.hasSubscription && info.subscriptionExpiry > block.timestamp) {
            info.subscriptionExpiry += duration;  // Add to existing duration
        } else {
            info.subscriptionExpiry = block.timestamp + duration;  // Start new subscription
            info.hasSubscription = true;
        }
        emit SubscriptionPurchased(to, duration);
    }

    // Internal function to handle referral commission
    function handleReferralCommission(uint256 payment) internal {
        address referrer = referrers[msg.sender];
        if (referrer != address(0)) {
            uint256 commission = (payment * REFERRAL_COMMISSION) / 1000; // 7.5%
            (bool sent,) = referrer.call{value: commission}("");
            if (sent) {
                emit ReferralPaid(referrer, commission);
            }
        }
    }

    // Daily pass functions
    function purchaseDailyPasses(uint256 count) external payable nonReentrant whenNotPaused {
        require(count > 0, "Must purchase at least one pass");
        uint256 totalCost = DAILY_SUB_COST * count;
        require(msg.value >= totalCost, "Insufficient payment");

        _addDailyPasses(msg.sender, count);
        handleReferralCommission(msg.value);
        emit DailyPassPurchased(msg.sender, count);
    }

    function giftDailyPass(address to, uint256 count) external payable nonReentrant whenNotPaused {
        require(count > 0, "Must gift at least one pass");
        require(to != address(0), "Invalid recipient");
        uint256 totalCost = GIFTED_PASS_COST * count;
        require(msg.value >= totalCost, "Insufficient payment");

        _addDailyPasses(to, count);
        handleReferralCommission(msg.value);
        emit DailyPassGifted(msg.sender, to, count);
    }

    function _addDailyPasses(address user, uint256 count) internal {
        UserInfo storage info = users[user];
        
        // If passes have expired, reset count and set new expiry
        if (info.passesExpiry < block.timestamp) {
            info.dailyPasses = count;
            info.passesExpiry = block.timestamp + (count * DAILY_DURATION);
        } else {
            // Add to existing passes and extend expiry
            info.dailyPasses += count;
            info.passesExpiry += (count * DAILY_DURATION);
        }
    }

    // View functions
    function canComment(address user) public view returns (bool) {
        UserInfo memory info = users[user];
        return (
            (info.hasSubscription && info.subscriptionExpiry > block.timestamp) ||
            info.depositBalance >= COMMENT_COST
        );
    }

    function getUserInfo(address user) external view returns (UserInfo memory) {
        return users[user];
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance - totalDeposits;
        require(balance > 0, "No balance to withdraw");
        (bool sent,) = owner().call{value: balance}("");
        require(sent, "Withdrawal failed");
    }

    // Fallback functions
    receive() external payable {}
    fallback() external payable {}
}