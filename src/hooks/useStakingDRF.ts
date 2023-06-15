import { useQuery } from '@tanstack/react-query'

import { getProtocolContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

export const useStakingDRF = () => {
  const { data } = useQuery(
    ['useStakingDRF'],
    async (): Promise<string> => {
      const c = getProtocolContract()
      const d = await c.stakingDrfPool()
      return formatUnits(String(d), 8)
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
