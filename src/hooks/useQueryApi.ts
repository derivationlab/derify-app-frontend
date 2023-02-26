import { useQuery } from 'react-query'

import { getCurrentIndexDAT, getCurrentPositionsAmount } from '@/api'
import { findToken } from '@/config/tokens'

export const useCurrentPositionsAmount = (quoteToken: string, marginToken: string) => {
  // console.info('getCurrentPositionsAmount:')
  // console.info(findToken(quoteToken).symbol, findToken(marginToken).symbol)
  const query = useQuery(
    ['getCurrentPositionsAmount'],
    async (): Promise<Record<string, any>> => {
      const data = await getCurrentPositionsAmount(quoteToken, marginToken)
      // console.info(data)
      return data
    },
    {
      retry: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return query
}

export const useCurrentIndexDAT = (marginToken: string) => {
  // console.info('getCurrentIndexDAT:')
  // console.info(findToken(marginToken).symbol)
  const query = useQuery(
    ['getCurrentIndexDAT'],
    async (): Promise<Record<string, any>> => {
      const data = await getCurrentIndexDAT(marginToken)
      // console.info(data)
      return data
    },
    {
      retry: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return query
}
