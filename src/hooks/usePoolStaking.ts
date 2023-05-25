import { useQuery } from '@tanstack/react-query'
import { isEmpty } from 'lodash'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { safeInterceptionValues } from '@/utils/tools'

export const getPoolStaking = async (trader: string): Promise<Rec> => {
  let output = {}
  const calls = [
    {
      name: 'getStakingInfo',
      address: contracts.derifyProtocol.contractAddress,
      params: [trader]
    }
  ]

  const response = await multicall(DerifyProtocolAbi, calls)

  if (!isEmpty(response)) {
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
    async () => {
      if (trader) {
        const data = await getPoolStaking(trader)
        return data
      }
      return null
    },
    {
      retry: 0,
      initialData: null,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
