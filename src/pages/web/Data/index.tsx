import React, { FC } from 'react'

import InsurancePool from './c/InsurancePool'
import PositionVolume from './c/PositionVolume'
import TradingVolume from './c/TradingVolume'

const Dashborad: FC = () => {
  return (
    <div className="web-data">
      <TradingVolume />
      <PositionVolume />
      <InsurancePool />
    </div>
  )
}

export default Dashborad
