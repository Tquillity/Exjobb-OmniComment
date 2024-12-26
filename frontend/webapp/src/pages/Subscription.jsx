// Frontend/webapp/src/pages/Subscription.jsx
import React, { useContext } from 'react';
import BlockchainHandler from '../components/BlockchainHandler';
import { BalanceContext } from '../contexts/BalanceContext';

export function Subscription({ user }) {
  const { balance, updateBalance } = useContext(BalanceContext);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Management</h2>
      <BlockchainHandler onBalanceUpdate={updateBalance} />
      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
          <p className="mt-2 text-gray-500">Free Plan</p>
          <p className="mt-2 text-gray-500">Balance: {parseFloat(balance).toFixed(4)} POL</p>
        </div>
      </div>
    </div>
  );
}