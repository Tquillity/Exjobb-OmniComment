import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

function App() {
  const [account, setAccount] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        // Get provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        
        // Request network change to Polygon if not on it
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }], // Polygon Mainnet
          })
        } catch (switchError) {
          // If Polygon network isn't added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/']
              }]
            })
          }
        }

        setAccount(accounts[0])
        setIsConnected(true)
      } else {
        alert('Please install MetaMask!')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', accounts => {
        setAccount(accounts[0])
        setIsConnected(Boolean(accounts[0]))
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', accounts => {
          setAccount(accounts[0])
          setIsConnected(Boolean(accounts[0]))
        })
      }
    }
  }, [])

  return (
    <div className="w-96 h-96 bg-gray-100"> 
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            OmniComment
          </h1>
          <button
            onClick={connectWallet}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isConnected ? 
              `Connected: ${account.slice(0,6)}...${account.slice(-4)}` : 
              'Connect Wallet'}
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* !!! MAIN CONTENT */}
      </main>
    </div>
  )
}

export default App