// backend/src/services/blockchainService.js
import { ethers } from 'ethers';
import contractABI from '../config/OmniCommentContractABI.json' assert { type: 'json' };
import User from '../models/User.js';

class BlockchainService {
  static async initialize() {
    const service = new BlockchainService();
    await service.initializeContract();
    return service;
  }

  constructor() {
    // Add specific validation for each required variable
    const requiredVars = {
      POLYGON_RPC_URL: process.env.POLYGON_RPC_URL,
      OMNI_COMMENT_CONTRACT_ADDRESS: process.env.OMNI_COMMENT_CONTRACT_ADDRESS
    };

    const missing = Object.entries(requiredVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    this.contractAddress = process.env.OMNI_COMMENT_CONTRACT_ADDRESS;
  }

  async initializeContract() {
    try {
      // Add debug logging
      console.log('Initializing contract with:', {
        rpcUrl: process.env.POLYGON_RPC_URL,
        contractAddress: process.env.OMNI_COMMENT_CONTRACT_ADDRESS
      });

      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI.abi,
        this.provider
      );
    } catch (error) {
      console.error('Contract initialization failed:', error);
      throw error;
    }
  }

  async monitorTransaction(tx) {
    const receipt = await tx.wait();
    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }
    return receipt;
  }

  async getUserInfo(walletAddress) {
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }
    try {
      const userInfo = await this.contract.getUserInfo(walletAddress);
      return {
        depositBalance: ethers.formatEther(userInfo.depositBalance),
        subscriptionExpiry: new Date(Number(userInfo.subscriptionExpiry) * 1000),
        hasSubscription: userInfo.hasSubscription,
        dailyPasses: Number(userInfo.dailyPasses),
        passesExpiry: new Date(Number(userInfo.passesExpiry) * 1000)
      };
    } catch (error) {
      console.error('Blockchain user info error:', error);
      throw error;
    }
  }

  async canComment(walletAddress) {
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }
    return this.contract.canComment(walletAddress);
  }

  async deposit(walletAddress, amount) {
    if (!ethers.isAddress(walletAddress) || amount <= 0) {
      throw new Error('Invalid deposit parameters');
    }
    try {
      const user = await User.findOne({ walletAddress });
      if (!user) throw new Error('User not found');

      const signer = await this.provider.getSigner(walletAddress);
      const tx = await this.contract.connect(signer).deposit({
        value: ethers.parseEther(amount.toString())
      });
      const receipt = await this.monitorTransaction(tx);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    }
  }

  async purchaseSubscription(walletAddress, duration, referrer = ethers.ZeroAddress) {
    if (!ethers.isAddress(walletAddress) || !Number.isInteger(duration) || duration <= 0) {
      throw new Error('Invalid subscription parameters');
    }
    try {
      const user = await User.findOne({ walletAddress });
      if (!user) throw new Error('User not found');

      const signer = await this.provider.getSigner(walletAddress);
      const tx = await this.contract.connect(signer).purchaseSubscription(duration, referrer);
      const receipt = await this.monitorTransaction(tx);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Subscription purchase error:', error);
      throw error;
    }
  }

  async purchaseDailyPasses(walletAddress, count) {
    if (!ethers.isAddress(walletAddress) || !Number.isInteger(count) || count <= 0) {
      throw new Error('Invalid daily pass parameters');
    }
    try {
      const user = await User.findOne({ walletAddress });
      if (!user) throw new Error('User not found');

      const signer = await this.provider.getSigner(walletAddress);
      const tx = await this.contract.connect(signer).purchaseDailyPasses(count);
      const receipt = await this.monitorTransaction(tx);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Daily passes purchase error:', error);
      throw error;
    }
  }
}

export default BlockchainService;