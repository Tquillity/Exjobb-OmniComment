// Frontend/webapp/src/services/web3.js
import { AMOY_NETWORK_CONFIG, AMOY_CHAIN_ID } from '../utils/constants';

export async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      console.log('Connected accounts:', accounts);

      // Get current chain ID
      const currentChainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      console.log('Current chain ID:', currentChainId);
      
      const currentChainDecimal = parseInt(currentChainId, 16);

      // Switch to Amoy if needed
      if (currentChainDecimal !== AMOY_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: AMOY_NETWORK_CONFIG.chainId }]
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [AMOY_NETWORK_CONFIG]
            });
          } else {
            throw switchError;
          }
        }
      }

      // Generate signature for authentication
      const address = accounts[0];
      const timestamp = Date.now();
      const message = `Sign this message to connect to OmniComment: ${timestamp}`;
      
      console.log('Requesting signature for message:', message);
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });

      console.log('Received signature:', signature);

      return {
        address,
        signature,
        message
      };
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  } else {
    throw new Error('Please install MetaMask');
  }
}