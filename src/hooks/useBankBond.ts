import { useQuery } from '@tanstack/react-query'

import { getRewardsContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

export const useBankBond = (rewards?: string) => {
  const { data } = useQuery(
    ['useBankBond'],
    async (): Promise<string> => {
      if (rewards) {
        const c = getRewardsContract(rewards)
        const d = await c.bankBondPool()
        return formatUnits(String(d), 8)
      }
      return '0'
    },
    {
      retry: 0,
      initialData: '0',
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
