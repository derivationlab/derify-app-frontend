import { isEmpty } from 'lodash'
import { useQuery } from '@tanstack/react-query'

import { Rec } from '@/zustand/types'
import {
  getCurrentIndexDAT,
  getCurrentInsuranceDAT,
  getCurrentPositionsAmount,
  getCurrentTotalPositionsNetValue,
  getCurrentTotalTradingNetValue,
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

export const useCurrentTotalTradingNetValue = (marginToken: string, quoteToken: string) => {
  const { data, refetch } = useQuery(
    ['getCurrentTotalTradingNetValue'],
    async (): Promise<any[]> => {
      const data = await getCurrentTotalTradingNetValue(marginToken, quoteToken)
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

export const useCurrentTotalPositionsNetValue = (marginToken: string, quoteToken: string) => {
  const { data, refetch } = useQuery(
    ['getCurrentTotalPositionsNetValue'],
    async (): Promise<any[]> => {
      const data = await getCurrentTotalPositionsNetValue(marginToken, quoteToken)
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
