import { useQuery } from '@tanstack/react-query'
import { isEmpty } from 'lodash'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import { marginTokenList } from '@/store'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export const useBoundPools = (list: (typeof marginTokenList)[]) => {
  let output = Object.create(null)

  const { data, isLoading } = useQuery(
    ['useBoundPools'],
    async () => {
      if (list.length) {
        const calls = list.map((token) => ({
          name: 'getAllSysExchangeBondSizeUpperBounds',
          params: [[token.margin_token]],
          address: contracts.derifyProtocol.contractAddress
        }))

        const response = await multicall(derifyProtocolAbi, calls)

        if (!isEmpty(response)) {
          response.forEach(([data]: any, index: number) => {
            output = {
              ...output,
              [list[index].symbol]: formatUnits(String(data[0]), 8)
            }
          })

          // console.info(output)
          return output
        }
      }

      return null
    },
    {
      retry: false,
      initialData: null,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}
