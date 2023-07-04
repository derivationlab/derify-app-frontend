import { BigNumberish } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'

import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { derivativeList } from '@/store'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

let output = Object.create(null)

export const usePositionChangeFeeRatios = (list?: (typeof derivativeList)[] | null) => {
  const { data, refetch, isLoading } = useQuery(
    ['usePositionChangeFeeRatios'],
    async () => {
      if (list) {
        const calls: Rec[] = []
        list.forEach((l) => {
          calls.push({
            name: 'getPositionChangeFeeRatio',
            token: l.token,
            address: l.derivative
          })
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
