import { isEmpty } from 'lodash'
import { useQuery } from '@tanstack/react-query'

import { bnPlus, isGTET, keepDecimals } from '@/utils/tools'
import { findMarginToken, findToken, MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginToken, MarginTokenKeys, QuoteToken, QuoteTokenKeys } from '@/typings'
import {
  getCurrentIndexDAT,
  getTraderBondBalance,
  getTraderEDRFBalance,
  getCurrentInsuranceDAT,
  getCurrentTradingAmount,
  getGrantPlanCount,
  getGrantPlanRatios,
  getCurrentPositionsAmount,
  getGrantPlanAmount,
  getCurrentTotalTradingNetValue,
  getCurrentTotalPositionsNetValue,
  getPairIndicator
} from '@/api'

const initial1 = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: {}
    }
  })

  return value
}

const initial2 = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0'
    }
  })

  return value
}

export const initial3 = (): QuoteToken => {
  let quote = Object.create(null)

  QUOTE_TOKENS.forEach((t) => {
    quote = {
      ...quote,
      [t.symbol]: {}
    }
  })

  return quote
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
  let output = initial1()

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
    ['getGrantPlanCount'],
    async (): Promise<{ count: number }> => {
      const data = await getGrantPlanCount(marginToken)
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
    ['getGrantPlanRatios'],
    async (): Promise<number> => {
      if (trader) {
        const data = await getGrantPlanRatios(marginToken, trader)

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
    ['getGrantPlanAmount'],
    async (): Promise<{ totalAmount: number }> => {
      const data = await getGrantPlanAmount(marginToken)
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

export const usePairIndicator = (marginToken: MarginTokenKeys): { data?: Record<string, any> } => {
  const output = initial3()

  const { data } = useQuery(
    ['usePairIndicator'],
    async (): Promise<Record<string, any>[]> => {
      const m = findMarginToken(marginToken)!
      const data = await getPairIndicator(m.tokenAddress)
      // console.info(data?.data)
      return data?.data ?? []
    },
    {
      retry: false,
      initialData: [],
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (data.length > 0) {
    data.forEach(
      ({
        token,
        longDrfPmrRate = 0,
        shortDrfPmrRate = 0,
        price_change_rate = 0,
        longMarginTokenPmrRate = 0,
        shortMarginTokenPmrRate = 0,
        ...rest
      }: Record<string, any>) => {
        const quote = findToken(token)?.symbol as QuoteTokenKeys
        const longPmrRate = bnPlus(longDrfPmrRate, longMarginTokenPmrRate)
        const shortPmrRate = bnPlus(shortDrfPmrRate, shortMarginTokenPmrRate)
        const pmrRateMax = keepDecimals(Math.max(Number(longPmrRate), Number(shortPmrRate)), 4)

        output[quote] = {
          ...output[quote],
          ...rest,
          apy: pmrRateMax,
          token,
          longPmrRate,
          shortPmrRate,
          price_change_rate
        }
      }
    )
    // console.info(output)
    return { data: output }
  }

  return { data: undefined }
}

export const usePairIndicators = () => {
  const output = initial1()

  const { data } = useQuery(
    ['usePairIndicators'],
    async () => {
      const promises = MARGIN_TOKENS.map(async (token) => {
        return [await getPairIndicator(token.tokenAddress).then(({ data }) => data)]
      })

      const response = await Promise.all(promises)

      if (response.length > 0) {
        response.forEach(([data], index) => {
          data.forEach(
            ({
              token,
              longDrfPmrRate = 0,
              shortDrfPmrRate = 0,
              longMarginTokenPmrRate = 0,
              shortMarginTokenPmrRate = 0
            }: Record<string, any>) => {
              const long = bnPlus(longDrfPmrRate, longMarginTokenPmrRate)
              const short = bnPlus(shortDrfPmrRate, shortMarginTokenPmrRate)
              const apyMax = isGTET(long, short) ? long : short

              if (MARGIN_TOKENS[index].symbol)
                output[MARGIN_TOKENS[index].symbol as MarginTokenKeys] = {
                  ...output[MARGIN_TOKENS[index].symbol as MarginTokenKeys],
                  [findToken(token)?.symbol]: Number(apyMax)
                }
            }
          )
        })
        console.info(output)

        return output
      }

      return output
    },
    {
      retry: false,
      initialData: output,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}

export const useMulCurrentTradingAmount = () => {
  let output = initial2()

  const { data, refetch } = useQuery(
    ['useMulCurrentTradingAmount'],
    async (): Promise<Record<string, any>> => {
      const promises = MARGIN_TOKENS.map(async (token) => {
        return [await getCurrentTradingAmount('all', token.tokenAddress).then(({ data }) => data)]
      })

      const response = await Promise.all(promises)

      if (response.length > 0) {
        response.forEach(([margin], index) => {
          output = {
            ...output,
            [MARGIN_TOKENS[index].symbol]: margin[0]?.trading_amount ?? 0
          }
        })
        // console.info(output)

        return output
      }

      return output
    },
    {
      retry: 0,
      initialData: output,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}
