import React, { FC, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useInterval } from 'react-use'

import { usePoolsInfo } from '@/zustand/usePoolsInfo'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useProtocolConf1 } from '@/hooks/useMatchConf'
import { useMarginToken, useQuoteToken } from '@/zustand'
import { getBankBDRFPoolDAT, getStakingDrfPoolDAT, getTraderRewardDAT, getTraderStakingDAT } from '@/hooks/helper'

import DRFPool from './c/DRFPool'
import EranbDRFPool from './c/bDRFPool'
import PositionMining from './c/PositionMining'

const Eran: FC = () => {
  const { data: account } = useAccount()

  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const updateRewardsInfo = useTraderInfo((state) => state.updateRewardsInfo)
  const updateStakingInfo = useTraderInfo((state) => state.updateStakingInfo)
  const updateDrfPoolBalance = usePoolsInfo((state) => state.updateDrfPoolBalance)
  const updateBondPoolBalance = usePoolsInfo((state) => state.updateBondPoolBalance)

  const { protocolConfig } = useProtocolConf1(quoteToken, marginToken)

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
    if (account?.address && protocolConfig) void _getTraderRewardDAT(account?.address, protocolConfig.rewards)
  }, [account?.address, protocolConfig])

  useEffect(() => {
    if (account?.address) void _getTraderStakingDAT(account?.address)
  }, [account?.address])

  useInterval(() => {
    if (account?.address) {
      void _getTraderStakingDAT(account?.address)
      if (protocolConfig) void _getTraderRewardDAT(account?.address, protocolConfig.rewards)
    }
    if (protocolConfig) void _getBankBDRFPoolDAT(protocolConfig.rewards)
    void _getStakingDrfPoolDAT()
  }, 3000)

  return (
    <div className="web-eran">
      <PositionMining />
      <DRFPool />
      <EranbDRFPool />
    </div>
  )
}

export default Eran
