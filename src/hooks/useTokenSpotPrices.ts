import { BigNumberish } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'

import { ZERO } from '@/config'
import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { DerAddressList } from '@/store'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

let output = Object.create(null)

/**
 {
    "BTCUSD": "0.00126258",
    "ETHUSD": "-0.00661609",
    "BNBUSD": "0.0"
}
 * @param list
 */
export const useTokenSpotPrices = (list?: DerAddressList | null) => {
  const { data, refetch, isLoading } = useQuery(
    ['useTokenSpotPrices'],
    async () => {
      if (list) {
        const calls: Rec[] = []
        const keys = Object.keys(list)
        keys.forEach((symbol) => {
          if (list[symbol].derivative !== ZERO) {
            calls.push({
              name: 'getSpotPrice',
              symbol,
              address: list[symbol].derivative
            })
          }
        })

        const response = await multicall(derifyDerivativeAbi, calls as any)

        if (response.length) {
          response.forEach(([spotPrice]: BigNumberish[], index: number) => {
            const _ = formatUnits(spotPrice, 8)
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
      initialData: null,
      refetchInterval: 3000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const useTokenSpotPricesSupport = (list?: string[] | null) => {
  const { data, refetch, isLoading } = useQuery(
    ['useTokenSpotPricesSupport'],
    async () => {
      if (list) {
        const calls = list.map((address) => ({ name: 'getSpotPrice', address }))

        const response = await multicall(derifyDerivativeAbi, calls)

        if (response.length) {
          response.forEach(([spotPrice]: BigNumberish[], index: number) => {
            output = {
              ...output,
              [list[index]]: formatUnits(spotPrice, 8)
            }
          })
        }
        console.info(output)
        return output
      }
      return null
    },
    {
      retry: false,
      initialData: null,
      refetchInterval: 3000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}
