import React, { FC, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useInterval } from 'react-use'

import { useProtocolConf } from '@/hooks/useMatchConf'
import { useMarginTokenStore, usePoolsInfoStore, useTraderInfoStore } from '@/store'
import { getBankBDRFPoolDAT, getStakingDrfPoolDAT, getTraderRewardDAT, getTraderStakingDAT } from '@/hooks/helper'
import PositionMining from './c/PositionMining'
import CompetitionPool from './c/Competition'
import MarginTokenPool from './c/MarginTokenPool'
import DerifyTokenPool from './c/DerifyTokenPool'

const Eran: FC = () => {
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const updateRewardsInfo = useTraderInfoStore((state) => state.updateRewardsInfo)
  const updateStakingInfo = useTraderInfoStore((state) => state.updateStakingInfo)
  const updateDrfPoolBalance = usePoolsInfoStore((state) => state.updateDrfPoolBalance)
  const updateBondPoolBalance = usePoolsInfoStore((state) => state.updateBondPoolBalance)

  const { protocolConfig } = useProtocolConf(marginToken)

  const _getTraderRewardDAT = async (trader: string, protocolConfig: string) => {
    const rewards = await getTraderRewardDAT(trader, protocolConfig)
    updateRewardsInfo(rewards)
  }

  const _getTraderStakingDAT = async (trader: string) => {
    const staking = await getTraderStakingDAT(trader)
    updateStakingInfo(staking)
  }

  const _getStakingDrfPoolDAT = async () => {
    const pool = await getStakingDrfPoolDAT()
    updateDrfPoolBalance(pool)
  }

  const _getBankBDRFPoolDAT = async (protocolConfig: string) => {
    const pool = await getBankBDRFPoolDAT(protocolConfig)
    updateBondPoolBalance(pool)
  }

  useEffect(() => {
    if (protocolConfig) void _getBankBDRFPoolDAT(protocolConfig.rewards)
  }, [protocolConfig])

  useEffect(() => {
    if (address && protocolConfig) void _getTraderRewardDAT(address, protocolConfig.rewards)
  }, [address, protocolConfig])

  useEffect(() => {
    if (address) void _getTraderStakingDAT(address)
  }, [address])

  useInterval(() => {
    if (address) {
      void _getTraderStakingDAT(address)
      if (protocolConfig) void _getTraderRewardDAT(address, protocolConfig.rewards)
    }
    if (protocolConfig) void _getBankBDRFPoolDAT(protocolConfig.rewards)
    void _getStakingDrfPoolDAT()
  }, 6000)

  return (
    <div className="web-eran">
      <PositionMining />
      <CompetitionPool />
      <DerifyTokenPool />
      <MarginTokenPool />
    </div>
  )
}

export default Eran
