import Token from '@/class/Token'
import { ChainId, TokenKeys } from '@/typings'

export const tokens: { [key in TokenKeys]: Token } = {
  btc: new Token(
    'Bitcoin',
    'BTC',
    {
      [ChainId.MAINNET]: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      [ChainId.TESTNET]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    },
    8
  ),
  eth: new Token(
    'Etherum',
    'ETH',
    {
      [ChainId.MAINNET]: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      [ChainId.TESTNET]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    },
    18
  ),
  busd: new Token(
    'BUSD',
    'BUSD',
    {
      [ChainId.MAINNET]: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      [ChainId.TESTNET]: '0xD5eC82071D0c870BfBa60B58A0AA52E42A3BEFba'
    },
    18
  ),
  bbusd: new Token(
    'bBUSD',
    'bBUSD',
    {
      [ChainId.MAINNET]: '0x301BdA168374AfF1F29640E88b68fFDe76d3479F',
      [ChainId.TESTNET]: '0x1DaDCC4EfA178D98C04d7EeA6c41df16712fEa61'
    },
    18
  ),
  drf: new Token(
    'DRF',
    'DRF',
    {
      [ChainId.MAINNET]: '0x89C1Af791d7B4cf046Dca8Fa10a41Dd2298A6a3F',
      [ChainId.TESTNET]: '0x11B876d9D5d18d70664153C84fD3084c1E71E2ef'
    },
    18
  ),
  matic: new Token(
    'MATIC',
    'MATIC',
    {
      [ChainId.MAINNET]: '0xc0cd7e6a0e1f71cea6c6e4885f2d2d30f7cd78a3',
      [ChainId.TESTNET]: '0xc0cd7e6a0e1f71cea6c6e4885f2d2d30f7cd78a3'
    },
    18
  ),
  bnb: new Token(
    'BNB',
    'BNB',
    {
      [ChainId.MAINNET]: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
      [ChainId.TESTNET]: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'
    },
    18
  ),
  edrf: new Token(
    'eDRF',
    'eDRF',
    {
      [ChainId.MAINNET]: '0x9d1b272B797137d3713f0bA2fA15abcc3a8C2Ef7',
      [ChainId.TESTNET]: '0xcFC597eEDFC368c19AFD22e581468a2e69eA5E24'
    },
    18
  ),
}

export const BASE_TOKEN_SYMBOL = tokens.busd.symbol

export const MARGIN_TOKENS = [tokens.drf, tokens.busd]

export const DEFAULT_MARGIN_TOKEN = tokens.busd.symbol

// key: (btc,eth...)/address
export const findToken = (key: string): Token => {
  // eslint-disable-next-line
  return Object.values(tokens).find((t) => t.symbol === key.toUpperCase() || t.tokenAddress === key.toLowerCase())!
}

export default tokens