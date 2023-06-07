import { BigNumberish } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'

import { ZERO } from '@/config'
import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { DerAddressList } from '@/store'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

/**
 {
    "BTCUSD": "0.00126258",
    "ETHUSD": "-0.00661609",
    "BNBUSD": "0.0"
}
 * @param list
 */
export const useTokenSpotPrices = (list?: DerAddressList | null) => {
  let output = Object.create(null)
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

export const useTokenSpotPricesSupport = (list?: Rec[] | null) => {
  let output: Rec[] = []
  const { data, refetch, isLoading } = useQuery(
    ['useTokenSpotPricesSupport'],
    async () => {
      if (list) {
        const calls = list.map((l) => ({
          name: 'getSpotPrice',
          address: l.derivative
        }))

        const response = await multicall(derifyDerivativeAbi, calls)

        if (response.length) {
          response.forEach(([spotPrice]: BigNumberish[], index: number) => {
            const x = { ...list[index], price: formatUnits(spotPrice, 8) }
            output = [...output, x]
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
