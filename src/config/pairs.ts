import { Token } from '@/config/types'
import { getAddress } from '@/utils/addressHelpers'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'

interface Base {
  quoteToken: Token
  pair: Pick<Token, 'name' | 'address'>
}

export interface Pair {
  name: string
  token: string
  symbol: string
  contract: string
}

const baseConfig: Base[] = [
  {
    quoteToken: {
      symbol: 'BTC',
      address: {
        56: '',
        97: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
      },
      decimals: 18,
      projectLink: ''
    },
    pair: {
      name: `BTC-${BASE_TOKEN_SYMBOL}`,
      address: {
        56: '',
        97: '0x770A2794c605d7579789617deECB401258cBE286'
      }
    }
  },
  {
    quoteToken: {
      symbol: 'ETH',
      address: {
        56: '',
        97: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      },
      decimals: 18,
      projectLink: ''
    },
    pair: {
      name: `ETH-${BASE_TOKEN_SYMBOL}`,
      address: {
        56: '',
        97: '0xf20dCFF4e673dbD3Ac912D41E3561f86c3fD9fe3'
      }
    }
  },
  // {
  //   quoteToken: {
  //     symbol: 'BNB',
  //     address: {
  //       56: '',
  //       97: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'
  //     },
  //     decimals: 18,
  //     projectLink: ''
  //   },
  //   pair: {
  //     name: `BNB-${BASE_TOKEN_SYMBOL}`,
  //     address: {
  //       56: '',
  //       97: '0xe7eCE523460CeB26b4f49a49399Bdf4A165d089F'
  //     }
  //   }
  // },
  {
    quoteToken: {
      symbol: 'MATIC',
      address: {
        56: '',
        97: '0xc0cd7e6a0e1f71cea6c6e4885f2d2d30f7cd78a3'
      },
      decimals: 18,
      projectLink: ''
    },
    pair: {
      name: `MATIC-${BASE_TOKEN_SYMBOL}`,
      address: {
        56: '',
        97: '0xf9772EDC945902FF03560Ae7A8d1899DA4116b6a'
      }
    }
  }
]

const composePairs = (): Pair[] => {
  return baseConfig.map(({ quoteToken, pair }) => {
    return {
      name: pair.name ?? '',
      token: getAddress(quoteToken.address),
      symbol: quoteToken.symbol ?? '',
      contract: getAddress(pair.address)
    }
  })
}

const pairs = composePairs()

export default pairs
