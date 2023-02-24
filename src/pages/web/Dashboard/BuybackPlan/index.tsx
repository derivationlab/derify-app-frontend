import React, { FC } from 'react'

import Datas from './Datas'
import Plan from './Plan'

const BuybackPlan: FC = () => {
  return (
    <div className="web-dashboard">
      <Datas />
      <Plan />
    </div>
  )
}

export default BuybackPlan
