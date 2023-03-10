import { isEmpty } from 'lodash'
import { useQuery } from 'react-query'

import { Rec } from '@/zustand/types'
import {
  getCurrentIndexDAT,
  getCurrentInsuranceDAT,
  getCurrentPositionsAmount,
  getCurrentTradingAmount,
  getTraderBondBalance,
  getTraderEDRFBalance
} from '@/api'

export const useCurrentPositionsAmount = (queryKey: string, quoteToken: string, marginToken: string) => {
  const { data, refetch } = useQuery(
    [queryKey],
    async (): Promise<Record<string, any>> => {
      const data = await getCurrentPositionsAmount(quoteToken, marginToken)
      return data?.data ?? {}
    },
    {
      retry: 0,
      initialData: {},
      refetchInterval: 5000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (!isEmpty(data)) return { refetch, data }

  return { refetch }
}

export const useCurrentIndexDAT = (marginToken: string) => {
  const { data, refetch } = useQuery(
    ['getCurrentIndexDAT'],
    async (): Promise<Record<string, any>> => {
      const data = await getCurrentIndexDAT(marginToken)
      // console.info(data)
      return data?.data ?? {}
    },
    {
      retry: 0,
      initialData: {},
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (!isEmpty(data)) return { refetch, data }

  return { refetch }
}

export const useTraderEDRFBalance = (trader = '') => {
  const { data } = useQuery(
    ['getTraderEDRFBalance'],
    async (): Promise<number> => {
      const data = await getTraderEDRFBalance(trader)
      return data?.data
    },
    {
      retry: 0,
      initialData: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}

export const useTraderBondBalance = (trader = '', address: string) => {
  const { data } = useQuery(
    ['getTraderBondBalance'],
    async (): Promise<number> => {
      const data = await getTraderBondBalance(trader, address)
      return data?.data
    },
    {
      retry: 0,
      initialData: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}

export const useCurrentTradingAmount = (address: string, marginToken: string) => {
  const { data, refetch } = useQuery(
    ['getCurrentTradingAmount'],
    async (): Promise<any[]> => {
      console.info(address, marginToken)
      const data = await getCurrentTradingAmount(address, marginToken)
      return data?.data ?? []
    },
    {
      retry: 0,
      initialData: [],
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (!isEmpty(data)) return { refetch, data }

  return { refetch }
}

export const useCurrentInsuranceDAT = (address: string) => {
  const { data, refetch } = useQuery(
    ['getCurrentInsuranceDAT'],
    async (): Promise<Rec> => {
      const data = await getCurrentInsuranceDAT(address)
      return data?.data ?? {}
    },
    {
      retry: 0,
      initialData: {},
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (!isEmpty(data)) return { data, refetch }

  return { refetch }
}
