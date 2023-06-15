import { useState, useEffect } from 'react'

import { PLATFORM_TOKEN } from '@/config/tokens'
import { GrantKeys, ProtocolConfig } from '@/typings'
import { getMiningContract, getRankingContract, getBrokerContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

export const minimumGrantInit: { [key in GrantKeys]: string } = {
  rank: '0',
  mining: '0',
  awards: '0'
}

export const useMinimumGrant = (config: ProtocolConfig | null) => {
  const [minimumGrant, setMinimumGrant] = useState<typeof minimumGrantInit>(minimumGrantInit)

  const _getMinimumGrant = async (config: ProtocolConfig) => {
    try {
      const { rank, awards, mining } = config
      const c1 = getMiningContract(mining)
      const c2 = getRankingContract(rank)
      const c3 = getBrokerContract(awards)

      const res1 = await c1.minGrantAmount()
      const res2 = await c2.minGrantAmount()
      const res3 = await c3.minGrantAmount()

      setMinimumGrant({
        rank: formatUnits(res2, PLATFORM_TOKEN.precision),
        mining: formatUnits(res1, PLATFORM_TOKEN.precision),
        awards: formatUnits(res3, PLATFORM_TOKEN.precision)
      })
    } catch (e) {
      console.info(e)
    }
  }

  useEffect(() => {
    if (config) void _getMinimumGrant(config)
  }, [config])

  return { minimumGrant }
}
