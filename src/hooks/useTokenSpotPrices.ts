import { BigNumberish } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { uniqBy } from 'lodash'

import { useEffect, useState } from 'react'

import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export const usePriceDecimals = (list?: Rec[] | null) => {
  const [priceDecimals, setPriceDecimals] = useState<Rec | null>(null)

  const func = async (list: Rec[]) => {
    let output = Object.create(null)
    const calls: Rec[] = []
    list.forEach((l) => {
      calls.push({
        name: 'getSpotPriceDecimals',
        address: l.derivative
      })
    })
    const response = await multicall(derifyDerivativeAbi, calls as any)
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

export const useTokenSpotPrices = (list?: Rec[] | null, decimals?: Rec | null, quoteToken?: Rec) => {
  const enabled = !!(list && decimals)
  const { data, refetch, isLoading } = useQuery(
    ['useTokenSpotPrices' + quoteToken],
    async () => {
      let output: Rec[] = []
      if (list && decimals) {
        let calls = list.map((l) => ({
          name: 'getSpotPrice',
          address: l.derivative
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
              name: quoteToken?.name,
              price: formatUnits(spotPrice, decimals[calls[index].address]),
              token: list[index]?.token,
              margin: list[index]?.margin
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
      refetchInterval: 3000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

// There are duplicate trading pairs
export const usePriceDecimalsForTrade = (list?: Rec[] | null) => {
  const [priceDecimals, setPriceDecimals] = useState<Rec | null>(null)

  const func = async (list: Rec[]) => {
    let output = Object.create(null)
    const calls: Rec[] = []
    uniqBy(list, 'name').forEach((l) => {
      calls.push({
        name: 'getSpotPriceDecimals',
        address: l.derivative
      })
    })
    const response = await multicall(derifyDerivativeAbi, calls as any)
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
        let calls = uniqBy(list, 'name').map((l) => ({
          name: 'getSpotPrice',
          address: l.derivative
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
              name: list[index]?.name,
              price: formatUnits(spotPrice, decimals[calls[index].address]),
              token: list[index]?.token,
              margin: list[index]?.margin
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
      refetchInterval: 3000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}
