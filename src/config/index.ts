import { ChainId, ChainIdRec } from '@/typings'

const API_PREFIX_URLS: ChainIdRec = {
  [ChainId.MAINNET]: 'https://pre-api-bnb-v2.derify.exchange/',
  [ChainId.TESTNET]: 'https://test-api-v2.derify.exchange/'
}

export const CHAIN_ID = process.env.REACT_APP_CHAIN_ID ?? ChainId.MAINNET
export const API_PREFIX_URL = API_PREFIX_URLS[CHAIN_ID]
export const WEBSITE_URL = 'https://derify.finance/'
export const PANCAKE_SWAP_URL = 'https://pancakeswap.finance/'
export const STATIC_RESOURCES_URL = 'https://derify-app-resources.vercel.app/image/'
export const LANG_CACHE_KEY = 'LANG'
export const TRADING_VISIBLE_COUNT = 20
export const MARGIN_VISIBLE_COUNT = 20
export const QUOTE_TOKEN_KEY = 'quote_v0.0.1'
export const MARGIN_TOKEN_KEY = 'margin_v0.0.1'
export const ZERO = '0x0000000000000000000000000000000000000000'
export const DerifyV1 = 'http://v1.derify.exchange/'
export const DerifyV20 = 'https://v20.derify.exchange/'
export const Docs = 'https://docs.derify.finance/'
export const Tutorial = 'https://docs.derify.finance/getting-started/tutorial'
export const Support = 'https://discord.com/channels/822422051099902053/827112242449350686'
export const Medium = 'https://derify.medium.com/'
export const Github = 'https://github.com/derivationlab'
export const Discord = 'https://discord.gg/kSR6tz2pdm'
export const Twitter = 'https://twitter.com/DerifyProtocol'
export const Telegram = 'https://t.me/DerifyProtocol_Official'
export const Advisor =
  'https://docs.google.com/forms/d/e/1FAIpQLSeaY9mj4Ix473wlGiGgROGXPIZsbps7ekbYvz5JBYoJacypSA/viewform'
export const Communities = {
  Twitter,
  Telegram,
  Discord,
  Medium,
  Github
}
