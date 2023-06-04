import { chunk, flatten } from 'lodash'
import { create } from 'zustand'

import exchangeAbi from '@/config/abi/DerifyExchange.json'
import { OpeningMaxLimitState } from '@/store/types'
import { quoteToken } from '@/store/useQuoteToken'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

const getOpeningMaxLimit = async (address: string, quote: typeof quoteToken) => {
  const output = Object.create(null)
  const calls = [
    {
      name: 'getSysOpenUpperBound',
      token: quote.token,
      params: [quote.token, 0],
      address
    },
    {
      name: 'getSysOpenUpperBound',
      token: quote.token,
      params: [quote.token, 1],
      address
    }
  ]

  try {
    // console.info(calls)
    const response = await multicall(exchangeAbi, flatten(calls))

    if (response.length) {
      const _chunk = chunk(response, 2)
      _chunk.forEach((data, index: number) => {
        const [long, short] = data
        output[calls[index].token] = {
          ...output[calls[index].token],
          long: formatUnits(String(long), 8),
          short: formatUnits(String(short), 8)
        }
      })
      // console.info(output)
      return output
    }

    return null
  } catch (e) {
    return null
  }
}

const useOpeningMaxLimitStore = create<OpeningMaxLimitState>((set) => ({
  openingMaxLimit: null,
  openingMaxLimitLoaded: false,
  getOpeningMaxLimit: async (address: string, quote: typeof quoteToken) => {
    const data = await getOpeningMaxLimit(address, quote)

    set({ openingMaxLimit: data })
  }
}))

export { useOpeningMaxLimitStore }
