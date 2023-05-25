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
export const usePositionChangeFeeRatios = (list?: DerAddressList | null) => {
  const { data, refetch, isLoading } = useQuery(
    ['usePositionChangeFeeRatios'],
    async () => {
      if (list) {
        const calls: Rec[] = []
        const keys = Object.keys(list)
        keys.forEach((token) => {
          if (list[token].derivative !== ZERO) {
            calls.push({
              name: 'getPositionChangeFeeRatio',
              token,
              address: list[token].derivative
            })
          }
        })

        const response = await multicall(derifyDerivativeAbi, calls as any)

        if (response.length) {
          response.forEach(([ratio]: BigNumberish[], index: number) => {
            output = {
              ...output,
              [calls[index].token]: formatUnits(ratio, 8)
            }
          })
        }

        return output
      }
      return null
    },
    {
      retry: false,
      initialData: null,
      refetchInterval: 5000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}
