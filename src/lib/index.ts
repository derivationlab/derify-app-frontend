import { Buffer } from 'buffer'
import toast from 'react-hot-toast'
import { createClient, defaultChains } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { BSC_SCAN_URL } from '@/config'

window.toast = toast

if (!window.Buffer) window.Buffer = Buffer

const rpcUrl = process.env.REACT_APP_PUBLIC_NODE ?? ''
const chainId = process.env.REACT_APP_CHAIN_ID

const bscChain = [
  {
    id: 97,
    name: 'BNB Smart Chain Testnet',
    network: 'BNB Smart Chain Testnet',
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
