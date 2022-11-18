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
        56: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
        97: ''
      },
      decimals: 18,
      projectLink: ''
    },
    pair: {
      name: `BTC-${BASE_TOKEN_SYMBOL}`,
      address: {
        56: '0x072A504a10d0291865197AA49Ca6B30F6E7BB9EE',
        97: ''
      }
    }
  },
  {
    quoteToken: {
      symbol: 'ETH',
      address: {
        56: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
        97: ''
      },
      decimals: 18,
      projectLink: ''
    },
    pair: {
      name: `ETH-${BASE_TOKEN_SYMBOL}`,
      address: {
        56: '0x396d8f9428387c2DBaAFDf1D9fC8abb00E055347',
        97: ''
      }
    }
  },
  // {
  //   quoteToken: {
  //     symbol: 'MATIC',
  //     address: {
  //       56: '',
  //       97: '0xc0cd7e6a0e1f71cea6c6e4885f2d2d30f7cd78a3'
  //     },
  //     decimals: 18,
  //     projectLink: ''
  //   },
  //   pair: {
  //     name: `MATIC-${BASE_TOKEN_SYMBOL}`,
  //     address: {
  //       56: '',
  //       97: '0xf9772EDC945902FF03560Ae7A8d1899DA4116b6a'
  //     }
  //   }
  // }
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
