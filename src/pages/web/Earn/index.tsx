import React, { FC, useEffect } from 'react'
import { useAccount, useBlockNumber } from 'wagmi'

import { useAppDispatch } from '@/store'
import { getBondInfoDataAsync, getPMRewardDataAsync, getStakingInfoDataAsync } from '@/store/trader'
import { getBankBDRFPoolDataAsync, getStakingDrfPoolDataAsync } from '@/store/constant'

import DRFPool from './c/DRFPool'
import EranbDRFPool from './c/bDRFPool'
import PositionMining from './c/PositionMining'

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

    dispatch(getBankBDRFPoolDataAsync())
    dispatch(getStakingDrfPoolDataAsync())
  }, [dispatch, account?.address, blockNumber])

  return (
    <div className="web-eran">
      <PositionMining />
      <DRFPool />
      <EranbDRFPool />
    </div>
  )
}

export default Eran
