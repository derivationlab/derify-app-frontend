import { BigNumberish } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { uniqBy } from 'lodash'

import { useEffect, useMemo, useState } from 'react'

import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

type List<T> = T | null

export const usePriceDecimals = (list?: List<Rec[]>, extra?: Rec[]) => {
  const [decimals, setDecimals] = useState<Rec | null>(null)

  const func = async (list: Rec[]) => {
    let output = Object.create(null)
    let calls = list.map((l) => ({
      name: 'getSpotPriceDecimals',
      address: l.derivative
    }))
    if (extra) {
      const filter = extra.filter((e) => !list.find((l) => l.name === e.name))
      const _calls = filter.map((f) => ({
        name: 'getSpotPriceDecimals',
        address: f.derivative
      }))
      calls = [...calls, ..._calls]
    }

    const response = await multicall(derifyDerivativeAbi, calls as any[])
    if (response.length) {
      response.forEach(([decimals]: BigNumberish[], index: number) => {
        const _ = Number(decimals)
        output = { ...output, [calls[index].address]: _ }
      })
    }
    setDecimals(output)
  }

  useEffect(() => {
    if (list && list.length) void func(list)
  }, [list])

  return { decimals }
}

function keyValue(l: Rec) {
  return {
    name: 'getSpotPrice',
    token: l.token,
    symbol: l.name,
    margin: l.margin_token,
    address: l.derivative
  }
}

export const useTokenSpotPrices = (list?: List<Rec[]>, decimals?: List<Rec>, extra?: Rec[]) => {
  const enabled = !!(list && list.length && decimals)
  const {
    data: spotPrices,
    refetch,
    isLoading
  } = useQuery(
    [`useTokenSpotPrices${extra && '-extra'}`],
    async () => {
      let output: Rec[] = []
      if (list && list.length && decimals) {
        let calls = list.map((l) => keyValue(l))
        if (extra) {
          const filter = extra.filter((e) => !list.find((l) => l.name === e.name))
          const _calls = filter.map((f) => keyValue(f))
          calls = [...calls, ..._calls]
        }
        const response = await multicall(derifyDerivativeAbi, calls as any[])
        if (response.length) {
          response.forEach(([spotPrice]: BigNumberish[], index: number) => {
            const x = {
              name: calls[index].symbol,
              price: formatUnits(spotPrice, decimals[calls[index].address]),
              token: calls[index].token,
              margin: calls[index].margin,
              precision: decimals[calls[index].address]
            }
            output = [...output, x]
          })
        }
        return output
      }
      return null
    },
    {
      retry: false,
      enabled,
      initialData: null,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { spotPrices, refetch, isLoading }
}

// There are duplicate trading pairs
export const usePriceDecimalsForTrade = (list?: Rec[] | null) => {
  const [priceDecimals, setPriceDecimals] = useState<Rec | null>(null)

  const func = async (list: Rec[]) => {
    let output = Object.create(null)
    const uniqList = uniqBy(list, 'name')
    const calls = uniqList.map((l) => ({
      name: 'getSpotPriceDecimals',
      address: l.pairAddress
    }))
    const response = await multicall(derifyDerivativeAbi, calls)
    if (response.length) {
      response.forEach(([decimals]: BigNumberish[], index: number) => {
        const _ = Number(decimals)
        output = { ...output, [calls[index].address]: _ }
      })
    }
    setPriceDecimals(output)
  }

  useEffect(() => {
    if (list) void func(list)
  }, [list])

  return { priceDecimals }
}

// There are duplicate trading pairs
export const useTokenSpotPricesForTrade = (list?: Rec[] | null, decimals?: Rec | null, quoteToken?: Rec) => {
  const enabled = !!(list && decimals)
  const { data, refetch, isLoading } = useQuery(
    ['useTokenSpotPricesForTrade'],
    async () => {
      let output: Rec[] = []
      if (list && decimals) {
        const uniqList = uniqBy(list, 'name')
        let calls = uniqList.map((l) => ({
          name: 'getSpotPrice',
          address: l.pairAddress
        }))
        const find = list.find((l) => l.name === quoteToken?.name)
        if (quoteToken && !find) {
          calls = [
            ...calls,
            {
              name: 'getSpotPrice',
              address: quoteToken.derivative
            }
          ]
        }
        const response = await multicall(derifyDerivativeAbi, calls)
        if (response.length) {
          response.forEach(([spotPrice]: BigNumberish[], index: number) => {
            const x = {
              name: uniqList[index]?.name,
              price: formatUnits(spotPrice, decimals[calls[index].address]),
              token: uniqList[index]?.token,
              margin: uniqList[index]?.margin,
              precision: decimals[calls[index].address]
            }
            output = [...output, x]
          })
        }
        return output
      }
      return null
    },
    {
      retry: false,
      enabled,
      initialData: null,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

// [{a},{b},{c}] get {a}
export const useTokenSpotPrice = (prices: Rec[] | null, tokeName: string) => {
  const target = useMemo(() => {
    if (prices) return prices.find((t) => t.name === tokeName)
  }, [prices, tokeName])

  return {
    spotPrice: target?.price ?? 0,
    precision: target?.precision ?? 8
  }
}
