import getEnvKey from '@/config/env'
import { ChainId } from '@/config/types'

const API_PREFIX_URLS_SCHEMA: Record<string, string> = {
  prod: 'https://api.derify.exchange/',
  dev: 'https://test-api-v2.derify.exchange/',
  pre: 'https://pre-api.derify.exchange/'
}

const EXPLORER_SCAN_URLS: Record<string, string> = {
  [ChainId.MAINNET]: 'https://bscscan.com',
  [ChainId.TESTNET]: 'https://testnet.bscscan.com'
}

const { REACT_APP_CHAIN_ID } = process.env

export const CHAIN_ID = process.env.REACT_APP_CHAIN_ID ?? ChainId.MAINNET
export const API_AUTH_KEY = 't3D3-L1GWNPwJQn1UbATcJ2Vrb--rMap'
export const API_PREFIX_URL = API_PREFIX_URLS_SCHEMA[getEnvKey()]
export const EXPLORER_SCAN_URL = EXPLORER_SCAN_URLS[REACT_APP_CHAIN_ID]
export const DEFAULT_PRC_URLS = {
  [ChainId.MAINNET]: 'https://bsc-dataseed1.binance.org',
  [ChainId.TESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545'
}
export const STATIC_RESOURCES_URL = 'https://derify-app-resources.vercel.app/image/'
export const PANCAKE_SWAP_URL = 'https://pancakeswap.finance/'
export const WEBSITE_URL = 'https://derify.finance/'
export const LANG_CACHE_KEY = 'LANG'
