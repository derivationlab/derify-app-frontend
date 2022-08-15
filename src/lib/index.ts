import toast from 'react-hot-toast'
import { Buffer } from 'buffer'
import { createClient, defaultChains } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'

import { BSC_SCAN_URL } from '@/config'
import { rpcUrl, chainId, netLabel } from '@/utils/baseProvider'

window.toast = toast

if (!window.Buffer) window.Buffer = Buffer

const bscChain = [
  {
    id: chainId,
    name: `BNB Smart Chain ${netLabel}`,
    network: `BNB Smart Chain ${netLabel}`,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: {
      default: rpcUrl
    },
    blockExplorers: {
      default: {
        name: 'BscScan',
        url: BSC_SCAN_URL
      }
    }
  }
]

export const client = createClient({
  autoConnect: true,
  connectors() {
    return [
      new MetaMaskConnector({ chains: bscChain, options: { shimDisconnect: true } }),
      new CoinbaseWalletConnector({
        chains: bscChain,
        options: {
          appName: 'Derify protocol',
          chainId: Number(chainId),
          jsonRpcUrl: rpcUrl
        }
      }),
      new WalletConnectConnector({
        chains: defaultChains,
        options: {
          qrcode: true,
          rpc: { [chainId]: rpcUrl }
        }
      }),
      new InjectedConnector({ chains: bscChain, options: { name: 'Injected', shimDisconnect: true } })
    ]
  }
})
