import { BigNumberish } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'

import { useEffect, useState } from 'react'

import { ZERO } from '@/config'
import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { DerAddressList } from '@/store'
import { Rec } from '@/typings'
import multicall, { multicallV2 } from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export const usePriceDecimals = (list?: DerAddressList | null) => {
  const [priceDecimals, setPriceDecimals] = useState<Rec | null>(null)

  const func = async (list: DerAddressList) => {
    let output = Object.create(null)
    const calls: Rec[] = []
    const keys = Object.keys(list)
    keys.forEach((symbol) => {
      calls.push({
        name: 'getSpotPriceDecimals',
        symbol,
        address: list[symbol].derivative
      })
    })
    const response = await multicallV2(derifyDerivativeAbi, calls as any)
    if (response.length) {
      response.forEach(([decimals]: BigNumberish[], index: number) => {
        const _ = Number(decimals)
        output = { ...output, [calls[index].symbol]: _, [calls[index].address]: _ }
      })
    }
    setPriceDecimals(output)
  }

  useEffect(() => {
    if (list) void func(list)
  }, [list])

  return { priceDecimals }
}

export const useTokenSpotPrices = (list?: DerAddressList | null, decimals?: Rec | null) => {
  let output = Object.create(null)
  const enabled = !!(list && decimals)
  const { data, refetch, isLoading } = useQuery(
    ['useTokenSpotPrices'],
    async () => {
      if (list && decimals) {
        const calls: Rec[] = []
        const keys = Object.keys(list)
        keys.forEach((symbol) => {
          calls.push({ name: 'getSpotPrice', symbol, address: list[symbol].derivative })
        })
        const response = await multicall(derifyDerivativeAbi, calls as any)
        if (response.length) {
          response.forEach(([spotPrice]: BigNumberish[], index: number) => {
            const _ = formatUnits(spotPrice, decimals[calls[index].symbol])
            output = {
              ...output,
              [calls[index].symbol]: _,
              [calls[index].address]: _
            }
          })
        }
        // console.info(output)
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

export const usePriceDecimalsSupport = (list?: Rec[] | null) => {
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

export const useTokenSpotPricesSupport = (list?: Rec[] | null, decimals?: Rec | null) => {
  let output: Rec[] = []
  const enabled = !!(list && decimals)
  const { data, refetch, isLoading } = useQuery(
    ['useTokenSpotPricesSupport'],
    async () => {
      if (list && decimals) {
        const calls = list.map((l) => ({
          name: 'getSpotPrice',
          address: l.derivative
        }))

        const response = await multicall(derifyDerivativeAbi, calls)

        if (response.length) {
          response.forEach(([spotPrice]: BigNumberish[], index: number) => {
            const x = { ...list[index], price: formatUnits(spotPrice, decimals[calls[index].address]) }
            output = [...output, x]
          })
        }
        // console.info(output)
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
