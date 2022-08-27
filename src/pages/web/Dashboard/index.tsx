import React, { FC } from 'react'

import Counts from './c/Counts'
import TradingVolume from './c/TradingVolume'
import PositionVolume from './c/PositionVolume'
import InsurancePool from './c/InsurancePool'

const Dashborad: FC = () => {
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
