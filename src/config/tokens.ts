import { Token } from '@/config/types'
import { getEnv } from '@/config/env'

// default for prod
const tokens: { [key: string]: Token } = {
  BTC: {
    symbol: 'BTC',
    address: {
      56: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      97: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    },
    decimals: 18,
    projectLink: ''
  },
  ETH: {
    symbol: 'ETH',
    address: {
      56: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      97: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    },
    decimals: 18,
    projectLink: ''
  },
  DUSD: {
    symbol: 'DUSD',
    address: {
      56: '',
      97: '0xD5eC82071D0c870BfBa60B58A0AA52E42A3BEFba'
    },
    decimals: 18,
    projectLink: ''
  },
  bBUSD: {
    symbol: 'bBUSD',
    address: {
      56: '',
      97: '0x97bE258158D28Cda9dCad2856de2F106C39F8581'
    },
    decimals: 18,
    projectLink: ''
  },
  DRF: {
    symbol: 'DRF',
    address: {
      56: '',
      97: '0x11B876d9D5d18d70664153C84fD3084c1E71E2ef'
    },
    decimals: 18,
    projectLink: ''
  },
  eDRF: {
    symbol: 'eDRF',
    address: {
      56: '',
      97: '0x7449279EEe321cc0A3e57E009d537243ad0176B7'
    },
    decimals: 18,
    projectLink: ''
  }
}

const envTable: { [string: string]: Record<string, Token> } = {
  dev: {
    bBUSD: {
      symbol: 'bBUSD',
      address: {
        56: '',
        97: '0xe545f5aeA093B84Cc500737b216F36Fc61B71Da1'
      },
      decimals: 18,
      projectLink: ''
    },
    eDRF: {
      symbol: 'eDRF',
      address: {
        56: '',
        97: '0xd531479f89A573CEa84d08Af1De67420e9734b82'
      },
      decimals: 18,
      projectLink: ''
    }
  },
  prod: {}
}

export const BASE_TOKEN_SYMBOL = 'BUSD'

export default Object.assign(tokens, envTable[getEnv()])
