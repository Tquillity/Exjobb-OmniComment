// contracts/test/MockFailingWallet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockFailingWallet {
    fallback() external payable {
        assembly {
            invalid()
        }
    }
    
    receive() external payable {
        assembly {
            invalid()
        }
    }
}