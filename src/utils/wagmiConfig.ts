import { createClient } from 'wagmi'
import { configureChains } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

export const INIT_RPC_URL = () => {
  const _rpc = localStorage.getItem('rpc')
  return _rpc ? _rpc : bsc?.rpcUrls?.default?.http?.[0] ?? ''
}

const { provider, chains } = configureChains(
  [bsc],
  [
    jsonRpcProvider({
      rpc: () => ({ http: INIT_RPC_URL() })
    })
  ]
)

export const metaMaskConnector = new MetaMaskConnector({
  chains,
  options: {
    shimDisconnect: false
  }
})

const coinbaseWalletConnector = new CoinbaseWalletConnector({
  chains,
  options: {
    appName: 'app'
  }
})

const walletConnectLegacyConnector = new WalletConnectLegacyConnector({
  chains,
  options: {
    qrcode: true
  }
})

const injectedConnector = new InjectedConnector({
  chains,
  options: {
    name: 'Injected',
    shimDisconnect: true
  }
})

export const client = createClient({
  provider,
  autoConnect: true,
  connectors: [metaMaskConnector, coinbaseWalletConnector, walletConnectLegacyConnector, injectedConnector]
})
