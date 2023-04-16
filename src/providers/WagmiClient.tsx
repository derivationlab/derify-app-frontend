import React from 'react'
import { Buffer } from 'buffer'
import type { WagmiConfigProps, Chain } from 'wagmi'
import { WagmiConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'
import { createClient, configureChains } from 'wagmi'

import { CHAIN_ID } from '@/config'
import { useRpcNodeStore } from '@/store'

if (!window.Buffer) window.Buffer = Buffer

const chain = getDefaultChainInfo()

function Provider(props: React.PropsWithChildren<Omit<WagmiConfigProps, 'client'>>) {
  const rpcUrl = useRpcNodeStore((state) => state.rpc)

  const { provider, chains } = configureChains(
    [chain],
    [
      jsonRpcProvider({
        rpc: () => ({ http: rpcUrl })
      })
    ]
  )

  const client = createClient({
    provider,
    autoConnect: true,
    connectors: () => {
      return [
        new MetaMaskConnector({
          chains: [chain],
          options: {
            shimDisconnect: false
          }
        }),
        new CoinbaseWalletConnector({
          chains,
          options: {
            appName: 'app'
          }
        }),
        new WalletConnectLegacyConnector({
          chains,
          options: {
            qrcode: true
          }
        }),
        new InjectedConnector({
          chains,
          options: {
            name: 'Injected',
            shimDisconnect: true
          }
        })
      ]
    }
  })

  return <WagmiConfig client={client}>{props.children}</WagmiConfig>
}

export default Provider

function getDefaultChainInfo(): Chain {
  const chain = [bscTestnet, bsc].find((chain: Chain) => chain.id === Number(CHAIN_ID))
  return chain ?? bsc
}
