import { Chain, createClient } from 'wagmi'
import { configureChains } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'

import { bsc, bscTestnet } from 'wagmi/chains'
import { CHAIN_ID, DEFAULT_PRC_URLS } from '@/config'

const chain = getDefaultChainInfo()

const rpcUrl = DEFAULT_PRC_URLS[CHAIN_ID]

const { provider, chains } = configureChains(
  [chain],
  [
    jsonRpcProvider({
      rpc: () => ({ http: rpcUrl })
    })
  ]
)

export const metaMaskConnector = new MetaMaskConnector({
  chains: [chain],
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

function getDefaultChainInfo(): Chain {
  const chain = [bscTestnet, bsc].find((chain: Chain) => chain.id === Number(CHAIN_ID))
  return chain ?? bsc
}
