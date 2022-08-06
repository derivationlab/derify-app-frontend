import React, { FC, useEffect } from 'react'
import { useAccount, useBlockNumber } from 'wagmi'
// import { useInterval } from 'react-use'

import { useAppDispatch } from '@/store'
import { getBondInfoDataAsync, getPMRewardDataAsync, getStakingInfoDataAsync } from '@/store/trader'

import PositionMining from './c/PositionMining'
import DRFPool from './c/DRFPool'
import EranbDRFPool from './c/bDRFPool'

import {
  getBankBDRFPoolDataAsync,
  getCurrentPositionsAmountDataAsync,
  getIndicatorDataAsync,
  getStakingDrfPoolDataAsync
} from '@/store/constant'

const Eran: FC = () => {
  const dispatch = useAppDispatch()
  const { data: account } = useAccount()
  const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
    if (account?.address) {
      dispatch(getPMRewardDataAsync(account?.address))
      dispatch(getBondInfoDataAsync(account?.address))
      dispatch(getStakingInfoDataAsync(account?.address))
    }
  }, [dispatch, account?.address, blockNumber])

  // api maybe error
  // useInterval(() => {
  //   dispatch(getCurrentPositionsAmountDataAsync())
  // }, 6000)

  useEffect(() => {
    dispatch(getIndicatorDataAsync())
    dispatch(getBankBDRFPoolDataAsync())
    dispatch(getStakingDrfPoolDataAsync())
    dispatch(getCurrentPositionsAmountDataAsync())
  }, [])

  return (
    <div className="web-eran">
      <PositionMining />
      <DRFPool />
      <EranbDRFPool />
    </div>
  )
}

export default Eran
