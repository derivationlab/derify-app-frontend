import Token from '@/class/Token'
import { ChainId, AllTokenKeys } from '@/typings'

export const tokens: { [key in AllTokenKeys]: Token } = {
  btc: new Token(
    'Bitcoin',
    'BTC',
    {
      [ChainId.MAINNET]: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      [ChainId.TESTNET]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    },
    8,
    8
  ),
  eth: new Token(
    'Etherum',
    'ETH',
    {
      [ChainId.MAINNET]: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      [ChainId.TESTNET]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    },
    18,
    8
  ),
  busd: new Token(
    'BUSD',
    'BUSD',
    {
      [ChainId.MAINNET]: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      [ChainId.TESTNET]: '0xD5eC82071D0c870BfBa60B58A0AA52E42A3BEFba'
    },
    18,
    2
  ),
  drf: new Token(
    'DRF',
    'DRF',
    {
      [ChainId.MAINNET]: '0x89C1Af791d7B4cf046Dca8Fa10a41Dd2298A6a3F',
      [ChainId.TESTNET]: '0x11B876d9D5d18d70664153C84fD3084c1E71E2ef'
    },
    18,
    2
  ),
  edrf: new Token(
    'eDRF',
    'eDRF',
    {
      [ChainId.MAINNET]: '0x9d1b272B797137d3713f0bA2fA15abcc3a8C2Ef7',
      [ChainId.TESTNET]: '0xcFC597eEDFC368c19AFD22e581468a2e69eA5E24'
    },
    18,
    2
  )
}

export const QUOTE_TOKENS = [tokens.btc, tokens.eth]

export const MARGIN_TOKENS = [tokens.busd, tokens.drf]

export const VALUATION_TOKEN_SYMBOL = 'USD'

export const DEFAULT_MARGIN_TOKEN = tokens.busd

export const PLATFORM_TOKEN = tokens.drf

// key: (btc,eth...)/address
export const findToken = (key: string): Token => {
  // eslint-disable-next-line
  const upper = key.toUpperCase()
  const lower = key.toLowerCase()
  return Object.values(tokens).find(
    (t) => t.symbol === upper || t.symbol === lower || t.symbol === key || t.tokenAddress === key.toLowerCase()
  )!
}

export const findMarginToken = (key: string): Token | undefined => {
  const upper = key.toUpperCase()
  const lower = key.toLowerCase()
  return MARGIN_TOKENS.find(
    (t) => t.symbol === upper || t.symbol === lower || t.symbol === key || t.tokenAddress === key.toLowerCase()
  )
}

export default tokens
