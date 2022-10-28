import { Token } from '@/config/types'
import { getEnv } from '@/config/env'

// default for prod
const tokens: { [key: string]: Token } = {
  BTC: {
    symbol: 'BTC',
    address: {
      56: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      97: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    },
    decimals: 18,
    projectLink: ''
  },
  ETH: {
    symbol: 'ETH',
    address: {
      56: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      97: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    },
    decimals: 18,
    projectLink: ''
  },
  DUSD: {
    symbol: 'DUSD',
    address: {
      56: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      97: '0xD5eC82071D0c870BfBa60B58A0AA52E42A3BEFba'
    },
    decimals: 18,
    projectLink: ''
  },
  bBUSD: {
    symbol: 'bBUSD',
    address: {
      56: '0x301BdA168374AfF1F29640E88b68fFDe76d3479F',
      97: '0x1DaDCC4EfA178D98C04d7EeA6c41df16712fEa61'
    },
    decimals: 18,
    projectLink: ''
  },
  DRF: {
    symbol: 'DRF',
    address: {
      56: '0x89C1Af791d7B4cf046Dca8Fa10a41Dd2298A6a3F',
      97: '0x11B876d9D5d18d70664153C84fD3084c1E71E2ef'
    },
    decimals: 18,
    projectLink: ''
  },
  eDRF: {
    symbol: 'eDRF',
    address: {
      56: '0x9d1b272B797137d3713f0bA2fA15abcc3a8C2Ef7',
      97: '0xcFC597eEDFC368c19AFD22e581468a2e69eA5E24'
    },
    decimals: 18,
    projectLink: ''
  },
  bnb: {
    symbol: 'BNB',
    address: {
      56: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
      97: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'
    },
    decimals: 18,
    projectLink: ''
  }
}

const envTable: { [string: string]: Record<string, Token> } = {
  dev: {
  },
  prod: {}
}

export const BASE_TOKEN_SYMBOL = 'BUSD'

export default Object.assign(tokens, envTable[getEnv()])
