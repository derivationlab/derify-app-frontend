import { Token } from '@/config/types'
import { getAddress } from '@/utils/addressHelpers'
import tokens, { BASE_TOKEN_SYMBOL } from '@/config/tokens'

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
      address: tokens.BTC.address,
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
      address: tokens.ETH.address,
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
  }
  // {
  //   quoteToken: {
  //     symbol: 'MATIC',
  //     address: tokens.MATIC.address,
  //     decimals: 18,
  //     projectLink: ''
  //   },
  //   pair: {
  //     name: `MATIC-${BASE_TOKEN_SYMBOL}`,
  //     address: {
  //       56: '0xf9772EDC945902FF03560Ae7A8d1899DA4116b6a',
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
