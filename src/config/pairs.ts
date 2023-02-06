import { ChainIdRec } from '@/typings'
import { getAddress } from '@/utils/addressHelpers'
import tokens, { BASE_TOKEN_SYMBOL } from '@/config/tokens'

interface Base {
  pairName: string
  quoteTokenName: string
  quoteTokenAddr: string
  pairContractAddr: ChainIdRec
}

export interface Pair {
  name: string
  token: string
  symbol: string
  contract: string
}

const baseConfig: Base[] = [
  {
    pairName: `${tokens.btc.symbol}-${BASE_TOKEN_SYMBOL}`,
    quoteTokenName: tokens.btc.symbol,
    quoteTokenAddr: tokens.btc.tokenAddress,
    pairContractAddr: {
      56: '0x072A504a10d0291865197AA49Ca6B30F6E7BB9EE',
      97: '0xEfEF8789f5A268d181b6187B40a5790935ce88f1'
    }
  },
  {
    pairName: `${tokens.eth.symbol}-${BASE_TOKEN_SYMBOL}`,
    quoteTokenName: tokens.eth.symbol,
    quoteTokenAddr: tokens.eth.tokenAddress,
    pairContractAddr: {
      56: '0x396d8f9428387c2DBaAFDf1D9fC8abb00E055347',
      97: '0x37C737765DB1D7AfA7d81C872ABcb8675c956bcB'
    }
  },
]

const composePairs = (): Pair[] => {
  return baseConfig.map((pair) => {
    return {
      name: pair.pairName,
      token: pair.quoteTokenAddr,
      symbol: pair.quoteTokenName,
      contract: getAddress(pair.pairContractAddr)
    }
  })
}

const pairs = composePairs()

export default pairs
