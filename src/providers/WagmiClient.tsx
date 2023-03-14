import React from 'react'
import { Buffer } from 'buffer'
import { WagmiConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'
import { createClient, configureChains } from 'wagmi'
import type { WagmiConfigProps } from 'wagmi'

import { useRpcStore } from '@/zustand'

if (!window.Buffer) window.Buffer = Buffer

function Provider(props: React.PropsWithChildren<Omit<WagmiConfigProps, 'client'>>) {
  const rpcUrl = useRpcStore((state) => state.rpc)

  console.info(rpcUrl)

  const { provider, chains } = configureChains(
    [bsc, bscTestnet],
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
        new MetaMaskConnector({ chains, options: { shimDisconnect: true } }),
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
