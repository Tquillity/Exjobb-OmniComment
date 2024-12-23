require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");
require("dotenv").config();

// Ensure required environment variables are set
const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

// Validate private key
if (!process.env.PRIVATE_KEY) {
  console.warn("⚠️  Warning: PRIVATE_KEY not found in .env file. Using default (invalid) key.");
}

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    amoy: {
      url: AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80002,
      gasPrice: "auto",
      verify: {
        etherscan: {
          apiUrl: "https://api-testnet.polygonscan.com/"
        }
      }
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN_API_KEY
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  gasReporter: {
    enabled: process.env.ENABLE_GAS_REPORTER === "true",
    currency: "USD",
    token: "MATIC"
  }
};

module.exports = config;