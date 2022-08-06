import React, { FC, useEffect } from 'react'

import { getIndicatorDataAsync } from '@/store/constant'
import { useAppDispatch } from '@/store'

import Counts from './c/Counts'
import TradingVolume from './c/TradingVolume'
import PositionVolume from './c/PositionVolume'
import InsurancePool from './c/InsurancePool'

const Dashborad: FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getIndicatorDataAsync())
  }, [])

  return (
    <div className="web-dashborad">
      <Counts />
      <TradingVolume />
      <PositionVolume />
      <InsurancePool />
    </div>
  )
}

export default Dashborad
