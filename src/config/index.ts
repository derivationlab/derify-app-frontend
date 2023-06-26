import { ChainId, ChainIdRec } from '@/typings'

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
export const Docs = 'https://docs.derify.finance/'
export const Tutorial = 'https://docs.derify.finance/getting-started/tutorial'
export const Support = 'https://discord.com/channels/822422051099902053/827112242449350686'
export const Medium = 'https://derify.medium.com/'
export const Github = 'https://github.com/derivationlab'
export const Discord = 'https://discord.gg/kSR6tz2pdm'
export const Twitter = 'https://twitter.com/DerifyProtocol'
export const Telegram = 'https://t.me/DerifyProtocol_Official'
export const Communities = {
  Twitter,
  Telegram,
  Discord,
  Medium,
  Github
}
export const FaucetLinks = {
  BNB: 'https://testnet.binance.org/faucet-smart',
  tTOKEN: 'https://docs.google.com/forms/d/e/1FAIpQLSeLFM9daYrB1g_gYRHItQZdc2IUG5Ob5Jtb2vEEMbmMqQ-ACA/viewform'
}
