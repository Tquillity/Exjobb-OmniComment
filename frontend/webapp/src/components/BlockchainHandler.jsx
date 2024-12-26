// Frontend/webapp/src/components/BlockchainHandler.jsx
import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { BalanceContext } from '../contexts/BalanceContext';

const OMNI_COMMENT_ADDRESS = import.meta.env.VITE_OMNI_COMMENT_CONTRACT_ADDRESS;

const BlockchainHandler = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [balance, setBalance] = useState('0');
  const [subscriptionDuration, setSubscriptionDuration] = useState('30'); // Default to monthly
  const { balance: contextBalance, updateBalance } = useContext(BalanceContext);

  // Fetch balance on component mount and after transactions
  useEffect(() => {
    fetchBalance();
  }, []);

  // Update fetchBalance function
  const fetchBalance = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        OMNI_COMMENT_ADDRESS,
        [
          'function getUserInfo(address) view returns ' +
          '(tuple(uint256 depositBalance, uint256 subscriptionExpiry, bool hasSubscription, ' +
          'uint256 dailyPasses, uint256 passesExpiry, bool hasReferrer))'
        ],
        provider
      );
      
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) return;
      
      const userInfo = await contract.getUserInfo(accounts[0].address);
      const newBalance = ethers.formatEther(userInfo[0]);
      setBalance(newBalance);
      
      // Propagate balance update to context
      updateBalance(newBalance);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }
  
    try {
      setLoading(true);
      setError('');
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Convert POL to Wei
      const depositWei = ethers.parseEther(depositAmount);
      
      // Send blockchain transaction
      const tx = await signer.sendTransaction({
        to: OMNI_COMMENT_ADDRESS,
        value: depositWei
      });
      
      await tx.wait();
  
      // After blockchain transaction succeeds, update backend
      const response = await fetch('http://localhost:3000/api/blockchain/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ amount: depositAmount })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update deposit in backend');
      }
      
      const data = await response.json();
      if (data.success) {
        setDepositAmount('');
        await updateBalance();
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(balance)) {
      setError('Please enter a valid withdrawal amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        OMNI_COMMENT_ADDRESS,
        ['function withdraw(uint256) external'],
        signer
      );
      
      const withdrawWei = ethers.parseEther(withdrawAmount);
      const tx = await contract.withdraw(withdrawWei);
      await tx.wait();
      
      setWithdrawAmount('');
      await updateBalance();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!subscriptionDuration) {
      setError('Please select a subscription duration');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Calculate subscription cost based on duration
      const duration = parseInt(subscriptionDuration);
      let cost;
      
      switch (duration) {
        case 365:
          cost = ethers.parseEther('0.003'); // Yearly cost
          break;
        case 30:
          cost = ethers.parseEther('0.002'); // Monthly cost
          break;
        default:
          cost = ethers.parseEther('0.001').mul(BigInt(duration)); // Daily cost
      }

      // Send transaction
      const tx = await signer.sendTransaction({
        to: OMNI_COMMENT_ADDRESS,
        value: cost
      });
      
      await tx.wait();
      await updateBalance(); // Update balance after subscription
      
      // Reset form
      setSubscriptionDuration('30');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}
      
      {/* Deposit Section */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Deposit POL</h2>
          <div className="text-sm text-gray-600">
            Balance: {parseFloat(contextBalance).toFixed(4)} POL
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Amount (POL)</label>
            <input
              type="number"
              min="0"
              step="0.001"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="0.01"
            />
          </div>
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
        </div>
      </div>

      {/* Withdraw Section */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Withdraw POL</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Amount (POL)</label>
            <input
              type="number"
              min="0"
              max={balance}
              step="0.001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="0.001"
            />
          </div>
          <button
            onClick={handleWithdraw}
            disabled={loading || parseFloat(balance) === 0}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>
      
      {/* Subscription Section */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Purchase Subscription</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Duration</label>
            <select
              value={subscriptionDuration}
              onChange={(e) => setSubscriptionDuration(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="1">1 Day (0.001 POL)</option>
              <option value="7">7 Days (0.007 POL)</option>
              <option value="30">1 Month (0.002 POL - 33% off)</option>
              <option value="365">1 Year (0.003 POL - 45% off)</option>
            </select>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockchainHandler;