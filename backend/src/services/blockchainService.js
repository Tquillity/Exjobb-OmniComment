// Backend/src/services/blockchainService.js
import { ethers } from 'ethers';
import contractABI from '../config/OmniCommentContractABI.json' assert { type: 'json' };
import User from '../models/User.js';

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    this.contract = new ethers.Contract(
      process.env.OMNI_COMMENT_CONTRACT_ADDRESS, 
      contractABI.abi, 
      this.provider
    );
  }

  async getUserInfo(walletAddress) {
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
    return this.contract.canComment(walletAddress);
  }

  async deposit(walletAddress, amount) {
    try {
      const user = await User.findOne({ walletAddress });
      if (!user) {
        throw new Error('User not found');
      }

      const signer = this.provider.getSigner(walletAddress);
      const tx = await this.contract.connect(signer).deposit({ 
        value: ethers.parseEther(amount) 
      });
      await tx.wait();

      return { 
        success: true, 
        transactionHash: tx.hash 
      };
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    }
  }

  async purchaseSubscription(walletAddress, duration, referrer = ethers.ZeroAddress) {
    try {
      const user = await User.findOne({ walletAddress });
      if (!user) {
        throw new Error('User not found');
      }
  
      const signer = this.provider.getSigner(walletAddress);
      const tx = await this.contract.connect(signer).purchaseSubscription(
        duration, 
        referrer
      );
      await tx.wait();
  
      return { 
        success: true, 
        transactionHash: tx.hash 
      };
    } catch (error) {
      console.error('Subscription purchase error:', error);
      throw error;
    }
  }
  
  async purchaseDailyPasses(walletAddress, count) {
    try {
      const user = await User.findOne({ walletAddress });
      if (!user) {
        throw new Error('User not found');
      }
  
      const signer = this.provider.getSigner(walletAddress);
      const tx = await this.contract.connect(signer).purchaseDailyPasses(count);
      await tx.wait();
  
      return { 
        success: true, 
        transactionHash: tx.hash 
      };
    } catch (error) {
      console.error('Daily passes purchase error:', error);
      throw error;
    }
  }
}

export default new BlockchainService();