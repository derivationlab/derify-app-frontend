import React from 'react'
import { Buffer } from 'buffer'
import { WagmiConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { createClient, configureChains } from 'wagmi'
import type { WagmiConfigProps } from 'wagmi'

import { useRpcStore } from '@/zustand'
import { chainId } from '@/utils/chainSupport'

if (!window.Buffer) window.Buffer = Buffer

function Provider(props: React.PropsWithChildren<Omit<WagmiConfigProps, 'client'>>) {
  const rpcUrl = useRpcStore((state) => state.rpc)

  const { provider, chains } = configureChains(
    [bsc, bscTestnet],
    [
      jsonRpcProvider({
        rpc: (chain) => ({ http: rpcUrl })
      })
    ]
  )

  const client = createClient({
    provider,
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({ chains, options: { shimDisconnect: true } }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: 'app',
          chainId: chainId,
          jsonRpcUrl: rpcUrl
        }
      }),
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: true,
        },
      }),
      new InjectedConnector({
        chains,
        options: {
          name: 'Injected',
          shimDisconnect: true
        }
      })
    ]
  })

  return <WagmiConfig client={client}>{props.children}</WagmiConfig>
}

export default Provider
