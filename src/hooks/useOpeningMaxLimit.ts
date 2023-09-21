import { flatten, times } from 'lodash-es'

import { useEffect, useState } from 'react'

import exchangeAbi from '@/config/abi/DerifyExchange.json'
import { quoteToken } from '@/store'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export const useOpeningMaxLimit = (exchange?: string, quote?: typeof quoteToken) => {
  const [openingMaxLimit, setOpeningMaxLimit] = useState<Rec | null>(null)

  useEffect(() => {
    const func = async (address: string, quote: typeof quoteToken) => {
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
          setOpeningMaxLimit(output)
        } else {
          setOpeningMaxLimit(null)
        }
      } catch (e) {
        setOpeningMaxLimit(null)
      }
    }

    if (exchange && quote) {
      void func(exchange, quote)
    }
  }, [quote, exchange])

  return {
    openingMaxLimit
  }
}
