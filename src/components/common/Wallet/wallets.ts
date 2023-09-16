import { ConnectorIds } from '@/typings'

export type Wallet<T = ConnectorIds> = {
  id: string
  icon: string
  title: string
  installed?: boolean
  connectorId: T
  downloadLink?: string
}

const isMetaMaskInstalled = () => {
  if (typeof window === 'undefined') return false
  if (window.ethereum?.isMetaMask) return true
  return !!window.ethereum?.providers?.some((p) => p.isMetaMask)
}

const wallets: Wallet[] = [
  {
    id: 'metaMask',
    icon: 'metamask.svg',
    title: 'MetaMask',
    get installed() {
      return isMetaMaskInstalled()
    },
    connectorId: ConnectorIds.MetaMask,
    downloadLink: 'https://metamask.io/download/'
  },
  {
    id: 'tokenPocket',
    title: 'TokenPocket',
    icon: `token-pocket.svg`,
    connectorId: ConnectorIds.Injected,
    get installed() {
      return typeof window !== 'undefined' && !!window.ethereum?.isTokenPocket
    },
    downloadLink: 'https://www.tokenpocket.pro/'
  },
  {
    id: 'coinbaseWallet',
    icon: 'coinbase.svg',
    title: 'Coinbase Wallet',
    connectorId: ConnectorIds.WalletLink
  },
  {
    id: 'walletConnect',
    icon: 'wallet-connect.svg',
    title: 'WalletConnect',
    connectorId: ConnectorIds.WalletConnect
  }
]

export const getWallets = () => {
  return wallets
}
