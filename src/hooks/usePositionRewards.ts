import { useQuery } from '@tanstack/react-query'

import derifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import { ProtocolConfig } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export const usePositionRewards = (trader?: string, protocols?: { [key: string]: ProtocolConfig }) => {
  let output = Object.create(null)

  const { data, refetch, isLoading } = useQuery(
    ['usePositionRewards'],
    async () => {
      if (trader && protocols) {
        const base = { name: 'getPositionReward', params: [trader] }
        const calls = Object.keys(protocols).map((p) => ({ ...base, address: protocols[p].rewards }))

        const response = await multicall(derifyRewardsAbi, calls)

        if (response.length) {
          response.forEach((data: any, index: number) => {
            const key = Object.keys(protocols)[index]
            const { drfBalance, marginTokenBalance } = data
            const _drfBalance = formatUnits(String(drfBalance), 8)
            const _marginTokenBalance = formatUnits(String(marginTokenBalance), 8)

            output = {
              ...output,
              [key]: {
                origin: _drfBalance,
                [key]: _marginTokenBalance
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
