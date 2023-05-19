import { useQuery } from '@tanstack/react-query'

import multicall from '@/utils/multicall'
import contracts from '@/config/contracts'
import { formatUnits } from '@/utils/tools'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import { marginTokenList } from '@/store'

export const useMarginBalances = (trader?: string, list?: typeof marginTokenList[]) => {
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

        const res = await multicall(derifyProtocolAbi, calls)

        if (res.length > 0) {
          res.forEach(([margin]: any[], index: number) => {
            const [{ balances }] = margin
            output = {
              ...output,
              [list[index].symbol]: formatUnits(String(balances), 8)
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
