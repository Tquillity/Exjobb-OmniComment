// src/services/web3.js
import { AMOY_NETWORK_CONFIG, AMOY_CHAIN_ID } from '../utils/constants';

export async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // First request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Get current chain ID
      const currentChainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      // Convert current chain ID to decimal for comparison
      const currentChainDecimal = parseInt(currentChainId, 16);

      // If we're not on Amoy, try to add/switch to it
      if (currentChainDecimal !== AMOY_CHAIN_ID) {
        try {
          // Try to switch to the network first
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ 
              chainId: AMOY_NETWORK_CONFIG.chainId 
            }]
          });
        } catch (switchError) {
          // If the network isn't added yet, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: AMOY_NETWORK_CONFIG.chainName,
                  chainId: AMOY_NETWORK_CONFIG.chainId,
                  nativeCurrency: AMOY_NETWORK_CONFIG.nativeCurrency,
                  rpcUrls: AMOY_NETWORK_CONFIG.rpcUrls,
                  blockExplorerUrls: AMOY_NETWORK_CONFIG.blockExplorerUrls
                }
              ]
            });
          } else {
            throw switchError;
          }
        }
      }

      return accounts[0];
    } catch (error) {
      throw new Error(error.message);
    }
  } else {
    throw new Error('Please install MetaMask');
  }
}