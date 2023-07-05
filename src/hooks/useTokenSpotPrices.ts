import { BigNumberish } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'

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
  let output: Rec[] = []
  const enabled = !!(list && decimals)
  const { data, refetch, isLoading } = useQuery(
    ['useTokenSpotPrices'],
    async () => {
      if (list && decimals) {
        const find = list.find((l) => l.name === quoteToken?.name)
        let calls = list.map((l) => ({
          name: 'getSpotPrice',
          address: l.derivative
        }))
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
              name: list[index]?.name || quoteToken?.name,
              price: formatUnits(spotPrice, decimals[calls[index].address])
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
