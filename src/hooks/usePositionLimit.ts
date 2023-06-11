import { flatten, times } from 'lodash'

import { useEffect, useState } from 'react'

import exchangeAbi from '@/config/abi/DerifyExchange.json'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

const getPositionLimit = async (address: string, quoteToken: string) => {
  const output = Object.create(null)
  const calls = [
    ...times(2, (index) => ({
      name: 'getSysCloseUpperBound',
      params: [quoteToken, index],
      address
    }))
  ]

  try {
    const response = await multicall(exchangeAbi, flatten(calls))
    if (response.length) {
      const [long, short] = response
      output[quoteToken] = {
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

export const usePositionLimit = (exchange?: string, token?: string) => {
  const [positionLimit, setPositionLimit] = useState<Rec | null>(null)

  const func = async (exchange: string, token: string) => {
    const data = await getPositionLimit(exchange, token)
    setPositionLimit(data)
  }

  useEffect(() => {
    if (exchange && token) {
      void func(exchange, token)
    }
  }, [token, exchange])

  return {
    positionLimit
  }
}
