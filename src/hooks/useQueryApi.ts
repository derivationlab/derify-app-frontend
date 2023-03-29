import { isEmpty } from 'lodash'
import { useQuery } from '@tanstack/react-query'

import { MarginToken } from '@/typings'
import { MARGIN_TOKENS } from '@/config/tokens'
import {
  getCurrentIndexDAT,
  getTraderBondBalance,
  getTraderEDRFBalance,
  getCurrentInsuranceDAT,
  getCurrentTradingAmount,
  getActiveRankGrantCount,
  getActiveRankGrantRatios,
  getCurrentPositionsAmount,
  getActiveRankGrantTotalAmount,
  getCurrentTotalTradingNetValue,
  getCurrentTotalPositionsNetValue
} from '@/api'

const initialMulCurrentIndexOutput = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: {}
    }
  })

  return value
}

export const useCurrentIndexDAT = (marginToken: string) => {
  const { data, refetch } = useQuery(
    ['useCurrentIndexDAT'],
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

export const useMulCurrentIndexDAT = () => {
  let output = initialMulCurrentIndexOutput()

  const { data } = useQuery(
    ['useMulCurrentIndexDAT'],
    async (): Promise<Record<string, any>> => {
      const promises = MARGIN_TOKENS.map(async (token) => {
        return [await getCurrentIndexDAT(token.tokenAddress).then(({ data }) => data)]
      })

      const response = await Promise.all(promises)

      if (response.length > 0) {
        response.forEach(([margin], index) => {
          output = {
            ...output,
            [MARGIN_TOKENS[index].symbol]: margin
          }
        })

        return output
      }

      return output
    },
    {
      retry: 0,
      initialData: output,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}

export const useTraderEDRFBalance = (trader = '') => {
  const { data, isLoading } = useQuery(
    ['getTraderEDRFBalance'],
    async (): Promise<number> => {
      const data = await getTraderEDRFBalance(trader)
      return data?.data
    },
    {
      retry: 0,
      // initialData: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}

export const useTraderBondBalance = (trader = '', address: string) => {
  const { data, isLoading } = useQuery(
    ['getTraderBondBalance'],
    async (): Promise<number> => {
      const data = await getTraderBondBalance(trader, address)
      return data?.data
    },
    {
      retry: 0,
      // initialData: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}

export const useCurrentInsuranceDAT = (address: string) => {
  const { data, refetch } = useQuery(
    ['getCurrentInsuranceDAT'],
    async () => {
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

export const useCurrentTradingAmount = (address: string, marginToken: string) => {
  const { data, refetch } = useQuery(
    ['useCurrentTradingAmount'],
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

export const useActiveRankGrantCount = (marginToken: string) => {
  const { data } = useQuery(
    ['getActiveRankGrantCount'],
    async (): Promise<{ count: number }> => {
      const data = await getActiveRankGrantCount(marginToken)
      return data?.data ?? { count: 0 }
    },
    {
      retry: 0,
      initialData: { count: 0 },
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}

export const useActiveRankGrantRatios = (marginToken: string, trader?: string) => {
  const { data } = useQuery(
    ['getActiveRankGrantRatios'],
    async (): Promise<number> => {
      if (trader) {
        const data = await getActiveRankGrantRatios(marginToken, trader)

        const _data = data?.data ?? []

        return _data.length > 0 ? Math.min.apply(null, _data) : 0
      }

      return 0
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

export const useCurrentPositionsAmount = (quoteToken: string, marginToken: string) => {
  const { data, refetch } = useQuery(
    ['useCurrentPositionsAmount'],
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

export const useActiveRankGrantTotalAmount = (marginToken: string) => {
  const { data } = useQuery(
    ['getActiveRankGrantTotalAmount'],
    async (): Promise<{ totalAmount: number }> => {
      const data = await getActiveRankGrantTotalAmount(marginToken)
      return data?.data ?? { totalAmount: 10 }
    },
    {
      retry: 0,
      initialData: { totalAmount: 0 },
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}

export const useCurrentTotalTradingNetValue = (marginToken: string, quoteToken: string) => {
  const base = { trading_net_value: 0 }
  const { data, refetch } = useQuery(
    ['useCurrentTotalTradingNetValue'],
    async (): Promise<typeof base> => {
      const { data } = await getCurrentTotalTradingNetValue(marginToken, quoteToken)

      return data?.[0] ?? base
    },
    {
      retry: 0,
      initialData: base,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}

export const useCurrentTotalPositionsNetValue = (marginToken: string, quoteToken: string) => {
  const base = { total_positions_net_value: 0 }
  const { data, refetch } = useQuery(
    ['getCurrentTotalPositionsNetValue'],
    async (): Promise<typeof base> => {
      const data = await getCurrentTotalPositionsNetValue(marginToken, quoteToken)
      return data?.data ?? base
    },
    {
      retry: 0,
      initialData: base,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { refetch, data }
}
