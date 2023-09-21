import { useQuery } from '@tanstack/react-query'
import { isArray } from 'lodash-es'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import { marginTokenList } from '@/store'
import { Rec } from '@/typings'
import { multicallV2 } from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export const useMarginBalances = (trader?: string, list?: (typeof marginTokenList)[], marginToken?: Rec) => {
  let output = Object.create(null)
  const { data, refetch, isLoading } = useQuery(
    ['useMarginBalances'],
    async () => {
      if (trader && isArray(list)) {
        const find = list.find((l) => l.symbol === marginToken?.symbol)
        let calls = list.map((l) => ({
          name: 'getAllMarginBalances',
          symbol: l.symbol,
          address: contracts.derifyProtocol.contractAddress,
          params: [
            [
              {
                traders: [trader],
                balances: [],
                marginToken: l.margin_token
              }
            ]
          ]
        }))
        if (marginToken && !find) {
          calls = [
            ...calls,
            {
              name: 'getAllMarginBalances',
              symbol: marginToken.symbol,
              address: contracts.derifyProtocol.contractAddress,
              params: [
                [
                  {
                    traders: [trader],
                    balances: [],
                    marginToken: marginToken.address
                  }
                ]
              ]
            }
          ]
        }

        const response = await multicallV2(derifyProtocolAbi, calls)

        if (response.length > 0) {
          response.forEach((data, index: number) => {
            if (data) {
              const [{ balances }] = data[0]
              output = {
                ...output,
                [calls[index].symbol]: formatUnits(String(balances), 8)
              }
            } else {
              output = {
                ...output,
                [calls[index].symbol]: '0'
              }
            }
          })
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

  return { data, refetch, isLoading }
}
