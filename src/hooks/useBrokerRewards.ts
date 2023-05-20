import { useQuery } from '@tanstack/react-query'

import derifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import { ProtocolConfig } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits, isLT } from '@/utils/tools'

export const useBrokerRewards = (trader?: string, protocols?: { [key: string]: ProtocolConfig }) => {
  let output = Object.create(null)

  const { data, refetch, isLoading } = useQuery(
    ['useBrokerRewards'],
    async () => {
      if (trader && protocols) {
        const base = { name: 'getBrokerReward', params: [trader] }
        const calls = Object.keys(protocols).map((p) => ({ ...base, address: protocols[p].rewards }))

        const response = await multicall(derifyRewardsAbi, calls)

        if (response.length) {
          response.forEach((data: any, index: number) => {
            const key = Object.keys(protocols)[index]
            const [{ drfRewardBalance, marginTokenRewardBalance }] = data
            const _drfRewardBalance = formatUnits(String(drfRewardBalance), 8)
            const _marginTokenRewardBalance = formatUnits(String(marginTokenRewardBalance), 8)

            output = {
              ...output,
              [key]: {
                origin: isLT(_drfRewardBalance, 0) ? '0' : _drfRewardBalance,
                [key]: isLT(_marginTokenRewardBalance, 0) ? '0' : _marginTokenRewardBalance
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
