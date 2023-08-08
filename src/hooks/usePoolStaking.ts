import { useQuery } from '@tanstack/react-query'

import DerifyPoolAbi from '@/config/abi/DerifyPool.json'
import contracts from '@/config/contracts'
import multicall from '@/utils/multicall'
import { safeInterceptionValues } from '@/utils/tools'

const initValues = {
  drfBalance: '0',
  edrfBalance: '0'
}

export const getPoolStaking = async (trader: string): Promise<typeof initValues> => {
  let output = initValues
  const calls = [
    {
      name: 'getStakingInfo',
      address: contracts.derifyPool.contractAddress,
      params: [trader]
    }
  ]

  const response = await multicall(DerifyPoolAbi, calls)

  if (response.length > 0) {
    const [{ drfBalance, edrfBalance }] = response
    // console.info('edrfBalance:', safeInterceptionValues(edrfBalance, 8))
    output = {
      drfBalance: safeInterceptionValues(drfBalance, 8),
      edrfBalance: safeInterceptionValues(edrfBalance, 8)
    }

    // console.info(output)
    return output
  }

  return output
}

export const usePoolStaking = (trader?: string) => {
  const { data } = useQuery(
    ['usePoolStaking'],
    async (): Promise<typeof initValues> => {
      if (trader) {
        const data = await getPoolStaking(trader)
        return data
      }
      return initValues
    },
    {
      retry: 0,
      initialData: initValues,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
