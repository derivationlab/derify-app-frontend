import { createClient } from 'wagmi'
import { configureChains } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { CHAIN_ID, DEFAULT_PRC_URLS } from '@/config'

const rpcUrl = DEFAULT_PRC_URLS[CHAIN_ID]

const { provider, chains } = configureChains(
  [bsc],
  [
    jsonRpcProvider({
      rpc: () => ({ http: rpcUrl })
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
