// src/pages/Home.jsx
import React from 'react';
import WalletConnect from '../components/WalletConnect';

export default function Home({ onConnect }) {  // Add onConnect prop
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-indigo-600">OmniComment</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connect your wallet to start commenting on any webpage
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <WalletConnect onConnect={onConnect} />
          </div>
        </div>
      </div>
    </div>
  );
}