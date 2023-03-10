import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

import { useInterval } from 'react-use'
import { getBrokerInfo } from '@/hooks/helper'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useQuoteToken } from '@/zustand'
import { useMTokenFromRoute } from '@/hooks/useTrading'

const init = {
  isBroker: false,
  drfRewardBalance: '0',
  accumulatedDrfReward: '0',
  marginTokenRewardBalance: '0',
  accumulatedMarginTokenReward: '0'
}

export const useBrokerInfoFromC = () => {
  const { data } = useAccount()

  const quoteToken = useQuoteToken((state) => state.quoteToken)

  const marginToken = useMTokenFromRoute()

  const { protocolConfig } = useProtocolConf(quoteToken, marginToken)

  const [brokerAssets, setBrokerAssets] = useState<typeof init>(init)

  const _getBrokerInfo = async (trader: string, rewards: string) => {
    const staking = await getBrokerInfo(trader, rewards)
    // console.info(staking)
    setBrokerAssets(staking)
  }

  useEffect(() => {
    if (data?.address && protocolConfig) {
      void _getBrokerInfo(data?.address, protocolConfig.rewards)
    }
  }, [data?.address, protocolConfig])

  useInterval(() => {
    if (data?.address && protocolConfig) {
      void _getBrokerInfo(data?.address, protocolConfig.rewards)
    }
  }, 6000)

  return { brokerAssets }
}
