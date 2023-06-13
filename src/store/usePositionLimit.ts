import { flatten, times } from 'lodash'
import { create } from 'zustand'

import exchangeAbi from '@/config/abi/DerifyExchange.json'
import { PositionLimitState } from '@/store/types'
import { quoteToken } from '@/store/useQuoteToken'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

const getPositionLimit = async (address: string, quote: typeof quoteToken) => {
  const output = Object.create(null)
  const calls = [
    ...times(2, (index) => ({
      name: 'getSysOpenUpperBound',
      token: quote.token,
      params: [quote.token, index],
      address
    }))
  ]

  try {
    const response = await multicall(exchangeAbi, flatten(calls))
    if (response.length) {
      const [long, short] = response
      output[quote.token] = {
        long: formatUnits(String(long), 8),
        short: formatUnits(String(short), 8)
      }
      // console.info(output)
      return output
    }

    return null
  } catch (e) {
    return null
  }
}

const usePositionLimitStore = create<PositionLimitState>((set) => ({
  positionLimit: null,
  getPositionLimit: async (address: string, quote: typeof quoteToken) => {
    const data = await getPositionLimit(address, quote)

    set({ positionLimit: data })
  }
}))

export { usePositionLimitStore }
