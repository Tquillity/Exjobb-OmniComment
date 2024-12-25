// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title OmniCommentPayment
 * @notice Handles payment logic for comments and subscriptions with deposit pool functionality
 * @dev Implements deposit system, subscriptions, daily passes, and referral program
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
        bool hasReferrer;           // Whether user has already used a referral
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

    // Custom errors
    error InsufficientPayment(uint256 required, uint256 provided);
    error InvalidDuration(uint256 provided, uint256 maxAllowed);
    error InvalidRecipient();
    error InsufficientBalance(uint256 required, uint256 available);
    error TransactionFailed();
    error Unauthorized();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Process incoming payment and handle referral if applicable
     * @param payer Address making the payment
     * @param amount Required payment amount
     * @param checkReferral Whether to process referral
     * @return netAmount Amount after referral commission
     */
    function _processPayment(
        address payer,
        uint256 amount,
        bool checkReferral
    ) internal returns (uint256 netAmount) {
        // Require exact payment - no excess allowed
        if (msg.value != amount) {
            revert InsufficientPayment(amount, msg.value);
        }
        
        netAmount = amount;
        
        if (checkReferral && !users[payer].hasReferrer) {
            address referrer = referrers[payer];
            if (referrer != address(0)) {
                uint256 commission = (amount * REFERRAL_COMMISSION) / 1000;
                (bool success,) = referrer.call{value: commission}("");
                if (!success) {
                    revert TransactionFailed();
                }
                netAmount -= commission;
                users[payer].hasReferrer = true;
                emit ReferralPaid(referrer, commission);
                emit ReferralRegistered(referrer, payer);
            }
        }

        return netAmount;
    }

    /**
     * @notice Update user's subscription status
     * @param user Address of the subscriber
     * @param duration Duration to add to subscription
     */
    function _updateSubscription(
        address user,
        uint256 duration
    ) internal returns (bool) {
        if (duration % DAILY_DURATION != 0) {
            revert InvalidDuration(duration, MAX_DAILY_COUNT * DAILY_DURATION);
        }

        UserInfo storage info = users[user];
        
        if (info.hasSubscription && info.subscriptionExpiry > block.timestamp) {
            info.subscriptionExpiry += duration;
        } else {
            info.subscriptionExpiry = block.timestamp + duration;
            info.hasSubscription = true;
        }

        emit SubscriptionPurchased(user, duration);
        return true;
    }

    /**
     * @notice Calculate subscription cost based on duration
     * @param duration Time period for subscription
     * @return cost Total cost for the subscription
     */
    function _calculateSubscriptionCost(
        uint256 duration
    ) internal pure returns (uint256) {
        if (duration == YEARLY_DURATION) return YEARLY_SUB_COST;
        if (duration == MONTHLY_DURATION) return MONTHLY_SUB_COST;
        
        uint256 daysCount = duration / DAILY_DURATION;
        if (daysCount == 0 || daysCount > MAX_DAILY_COUNT) {
            revert InvalidDuration(duration, MAX_DAILY_COUNT * DAILY_DURATION);
        }
        
        return DAILY_SUB_COST * daysCount;
    }

    /**
     * @notice Allow users to deposit funds for comments
     */
    function deposit() external payable whenNotPaused {
        if (msg.value < MIN_DEPOSIT) {
            revert InsufficientPayment(MIN_DEPOSIT, msg.value);
        }
        
        users[msg.sender].depositBalance += msg.value;
        totalDeposits += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Allow users to withdraw their deposits
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        UserInfo storage user = users[msg.sender];
        if (amount > user.depositBalance) {
            revert InsufficientBalance(amount, user.depositBalance);
        }

        user.depositBalance -= amount;
        totalDeposits -= amount;
        
        (bool sent,) = msg.sender.call{value: amount}("");
        if (!sent) revert TransactionFailed();
        
        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @notice Process payment for a comment
     * @param user Address of the commenter
     */
    function processCommentPayment(address user) external whenNotPaused {
        if (msg.sender != owner() && msg.sender != address(this)) {
            revert Unauthorized();
        }

        if (!canComment(user)) {
            revert InsufficientBalance(COMMENT_COST, users[user].depositBalance);
        }

        UserInfo storage info = users[user];
        if (info.hasSubscription && info.subscriptionExpiry > block.timestamp) {
            return;
        }

        info.depositBalance -= COMMENT_COST;
        totalDeposits -= COMMENT_COST;
        emit CommentPaid(user, COMMENT_COST);
    }

    /**
     * @notice Purchase a subscription with optional referral
     * @param duration Length of subscription
     * @param referrer Address of referrer
     */
    function purchaseSubscription(
        uint256 duration,
        address referrer
    ) external payable nonReentrant whenNotPaused {
        uint256 cost = _calculateSubscriptionCost(duration);
        
        if (referrer != address(0) && !users[msg.sender].hasReferrer) {
            referrers[msg.sender] = referrer;
        }
        _processPayment(msg.sender, cost, true);
        _updateSubscription(msg.sender, duration);
    }

    /**
     * @notice Gift a subscription to another user
     * @param to Recipient address
     * @param duration Length of subscription
     */
    function giftSubscription(
        address to,
        uint256 duration
    ) external payable nonReentrant whenNotPaused {
        if (to == address(0)) revert InvalidRecipient();
        
        uint256 cost = _calculateSubscriptionCost(duration);
        _processPayment(msg.sender, cost, true);
        _updateSubscription(to, duration);
    }

    /**
     * @notice Purchase daily passes
     * @param count Number of passes to purchase
     */
    function purchaseDailyPasses(
        uint256 count
    ) external payable nonReentrant whenNotPaused {
        if (count == 0) revert InvalidDuration(0, MAX_DAILY_COUNT);
        
        uint256 totalCost = DAILY_SUB_COST * count;
        _processPayment(msg.sender, totalCost, true);
        _addDailyPasses(msg.sender, count);
        
        emit DailyPassPurchased(msg.sender, count);
    }

    /**
     * @notice Gift daily passes to another user
     * @param to Recipient address
     * @param count Number of passes to gift
     */
    function giftDailyPass(
        address to,
        uint256 count
    ) external payable nonReentrant whenNotPaused {
        if (to == address(0)) revert InvalidRecipient();
        if (count == 0) revert InvalidDuration(0, MAX_DAILY_COUNT);
        
        uint256 totalCost = GIFTED_PASS_COST * count;
        _processPayment(msg.sender, totalCost, true);
        _addDailyPasses(to, count);
        
        emit DailyPassGifted(msg.sender, to, count);
    }

    /**
     * @notice Add daily passes to a user's account
     * @param user Recipient address
     * @param count Number of passes to add
     */
    function _addDailyPasses(address user, uint256 count) internal {
        UserInfo storage info = users[user];
        
        if (info.passesExpiry < block.timestamp) {
            info.dailyPasses = count;
            info.passesExpiry = block.timestamp + (count * DAILY_DURATION);
        } else {
            info.dailyPasses += count;
            info.passesExpiry += (count * DAILY_DURATION);
        }
    }

    /**
     * @notice Check if a user can comment
     * @param user Address to check
     * @return bool Whether user can comment
     */
    function canComment(address user) public view returns (bool) {
        UserInfo memory info = users[user];
        return (info.hasSubscription && info.subscriptionExpiry > block.timestamp) ||
               info.depositBalance >= COMMENT_COST;
    }

    /**
     * @notice Get user information
     * @param user Address to query
     * @return UserInfo User's current status
     */
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

    /**
     * @notice Withdraw excess funds (excluding user deposits)
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance - totalDeposits;
        if (balance == 0) revert InsufficientBalance(1, 0);
        
        (bool sent,) = owner().call{value: balance}("");
        if (!sent) revert TransactionFailed();
    }

    receive() external payable {}
    fallback() external payable {}
}