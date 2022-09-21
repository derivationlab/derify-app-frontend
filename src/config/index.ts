import getEnvKey from '@/config/env'
import { ChainId } from '@/config/types'

const API_PREFIX_URLS_SCHEMA: Record<string, string> = {
  prod: 'https://pre-api.derify.exchange/',
  dev: 'https://pre-api.derify.exchange'
}

const BSC_SCAN_URLS_SCHEMA: Record<string, string> = {
  [ChainId.MAINNET]: 'https://bscscan.com',
  [ChainId.TESTNET]: 'https://testnet.bscscan.com'
}

const { REACT_APP_CHAIN_ID } = process.env

export const API_PREFIX_URL = API_PREFIX_URLS_SCHEMA[getEnvKey()]
export const BSC_SCAN_URL = BSC_SCAN_URLS_SCHEMA[REACT_APP_CHAIN_ID]
export const STATIC_RESOURCES_URL = 'https://derify-app-resources.vercel.app/image/'
export const PANCAKE_SWAP_URL = 'https://pancakeswap.finance/'
export const WEBSITE_URL = 'https://derify.finance/'
export const LANG_CACHE_KEY = 'LANG'
