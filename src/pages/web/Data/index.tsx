import React, { FC } from 'react'

import TradingVolume from './c/TradingVolume'
import PositionVolume from './c/PositionVolume'
import InsurancePool from './c/InsurancePool'

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
