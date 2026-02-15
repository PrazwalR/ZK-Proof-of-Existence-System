import { createRoot } from 'react-dom/client'
import './global.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { PrivyProvider } from '@privy-io/react-auth'
import { Toaster } from 'react-hot-toast'

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'YOUR_PRIVY_APP_ID'

const arbitrumSepolia = {
  id: 421614,
  name: 'Arbitrum Sepolia',
  network: 'arbitrum-sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
  },
  testnet: true,
}

createRoot(document.getElementById('root')).render(
  <PrivyProvider
    appId={PRIVY_APP_ID}
    config={{
      loginMethods: ['google', 'email'],
      appearance: {
        theme: 'dark',
        accentColor: '#6366f1',
        logo: '/assets/logo.svg',
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets',
      },
      defaultChain: arbitrumSepolia,
      supportedChains: [arbitrumSepolia],
    }}
  >
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e1e2e',
            color: '#fff',
            border: '1px solid #334155',
          },
        }}
      />
    </BrowserRouter>
  </PrivyProvider>,
)
