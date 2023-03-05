import { useQuery } from 'react-query'

import { Rec } from '@/zustand/types'
import {
  getCurrentIndexDAT,
  getCurrentInsuranceData,
  getCurrentPositionsAmount,
  getCurrentTradingAmount,
  getTraderBondBalance,
  getTraderEDRFBalance
} from '@/api'

export const useCurrentPositionsAmount = (quoteToken: string, marginToken: string) => {
  const query = useQuery(
    ['getCurrentPositionsAmount'],
    async (): Promise<Record<string, any>> => {
      const data = await getCurrentPositionsAmount(quoteToken, marginToken)
      return data?.data
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

export const useTraderEDRFBalance = (trader = '') => {
  const query = useQuery(
    ['getTraderEDRFBalance'],
    async (): Promise<Record<string, any>> => {
      const data = await getTraderEDRFBalance(trader)
      console.info('edrfBalance:', data?.data)
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

export const useTraderBondBalance = (trader = '', address: string) => {
  const query = useQuery(
    ['getTraderBondBalance'],
    async (): Promise<Record<string, any>> => {
      const data = await getTraderBondBalance(trader, address)
      console.info('bondBalance:', data?.data)
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

export const useCurrentTradingAmount = (address: string, marginToken: string) => {
  const query = useQuery(
    ['getCurrentTradingAmount'],
    async (): Promise<any[]> => {
      const data = await getCurrentTradingAmount(address, marginToken)
      return data?.data
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

export const useCurrentInsuranceDAT = (address: string) => {
  const query = useQuery(
    ['getCurrentInsuranceData'],
    async (): Promise<Rec> => {
      const data = await getCurrentInsuranceData(address)
      return data?.data
    },
    {
      retry: 0,
      placeholderData: {},
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return query
}
