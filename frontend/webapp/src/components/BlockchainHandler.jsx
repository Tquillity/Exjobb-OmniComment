// Frontend/webapp/src/components/BlockchainHandler.jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';

const OMNI_COMMENT_ADDRESS = import.meta.env.VITE_OMNI_COMMENT_CONTRACT_ADDRESS;

const BlockchainHandler = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [subscriptionDuration, setSubscriptionDuration] = useState('30'); // Default to monthly

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
      
      // Send transaction
      const tx = await signer.sendTransaction({
        to: OMNI_COMMENT_ADDRESS,
        value: depositWei
      });
      
      await tx.wait();
      
      // Update UI after successful deposit
      setDepositAmount('');
      // You'll want to refresh user's balance here
      
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
          cost = ethers.parseEther('0.001').mul(BigInt(duration)); // Daily cost, using BigInt for multiplication
      }

      // Send transaction
      const tx = await signer.sendTransaction({
        to: OMNI_COMMENT_ADDRESS,
        value: cost
      });
      
      await tx.wait();
      
      // Reset form and refresh user's subscription status
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
        <h2 className="text-lg font-semibold mb-4">Deposit POL</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Amount (POL)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="1.0"
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