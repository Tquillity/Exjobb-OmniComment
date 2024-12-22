// Frontend/webapp/src/utils/constants.js
export const APP_NAME = 'OmniComment';
export const CHAIN_ID = '0x89';  // Polygon Mainnet
export const AMOY_CHAIN_ID = 80002;  // Using decimal format

export const AMOY_NETWORK_CONFIG = {
  chainId: `0x${AMOY_CHAIN_ID.toString(16)}`,  // Converts to hex for RPC calls
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
  blockExplorerUrls: ['https://www.oklink.com/amoy']
};