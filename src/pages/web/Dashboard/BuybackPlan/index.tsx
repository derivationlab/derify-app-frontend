import React, { FC } from 'react'

import Plan from './Plan'
import Datas from './Datas'

const BuybackPlan: FC = () => {
  return (
    <div className="web-dashboard">
      <Datas />
      <Plan />
    </div>
  )
}

export default BuybackPlan
