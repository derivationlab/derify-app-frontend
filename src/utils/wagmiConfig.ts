import { createClient } from 'wagmi'
import { configureChains } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

export const INIT_RPC_URL = () => {
  const _rpc = localStorage.getItem('rpc')
  if (_rpc) {
    return _rpc
  } else {
    return bscTestnet?.rpcUrls?.default?.http?.[0] ?? ''
  }
}

const { provider, chains } = configureChains(
  [bscTestnet],
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

const walletConnectLegacyConnector = new WalletConnectConnector({
  chains,
  options: {
    projectId: 'c2d2ac98472d4798059202303ecc6ccb',
    showQrModal: true
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
