import { useQuery } from '@tanstack/react-query'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import { marginTokenList } from '@/store'
import { multicallV2 } from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export const useMarginBalances = (trader?: string, list?: (typeof marginTokenList)[]) => {
  let output = Object.create(null)
  const { data, refetch, isLoading } = useQuery(
    ['useMarginBalances'],
    async () => {
      if (trader && list && list.length) {
        const calls = list.map((token) => ({
          name: 'getAllMarginBalances',
          address: contracts.derifyProtocol.contractAddress,
          params: [
            [
              {
                traders: [trader],
                balances: [],
                marginToken: token.margin_token
              }
            ]
          ]
        }))

        const response = await multicallV2(derifyProtocolAbi, calls)

        if (response.length > 0) {
          response.forEach((data, index: number) => {
            if (data) {
              const [{ balances }] = data[0]
              output = {
                ...output,
                [list[index].symbol]: formatUnits(String(balances), 8)
              }
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
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}
