import { ChainId } from '@/config/types'
import { ChainIdRec } from '@/typings'

const API_PREFIX_URLS: ChainIdRec = {
  [ChainId.MAINNET]: 'https://api.derify.exchange/',
  [ChainId.TESTNET]: 'https://test-api-v2.derify.exchange/'
}

const EXPLORER_SCAN_URLS: Record<string, string> = {
  [ChainId.MAINNET]: 'https://bscscan.com',
  [ChainId.TESTNET]: 'https://testnet.bscscan.com'
}

export const DEFAULT_PRC_URLS = {
  [ChainId.MAINNET]: 'https://bsc-dataseed1.binance.org',
  [ChainId.TESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545'
}

export const CHAIN_ID = process.env.REACT_APP_CHAIN_ID ?? ChainId.MAINNET
export const API_PREFIX_URL = API_PREFIX_URLS[CHAIN_ID]
export const EXPLORER_SCAN_URL = EXPLORER_SCAN_URLS[CHAIN_ID]
export const WEBSITE_URL = 'https://derify.finance/'
export const PANCAKE_SWAP_URL = 'https://pancakeswap.finance/'
export const STATIC_RESOURCES_URL = 'https://derify-app-resources.vercel.app/image/'
export const LANG_CACHE_KEY = 'LANG'
export const BEST_RPC_KEY = 'best-rpc'
export const ZERO = '0x0000000000000000000000000000000000000000'
