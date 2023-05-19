import React, { FC } from 'react'

import Dashboard from './c/Dashboard'
import Data from './c/Data'
import Info from './c/Info'

const BrokerWorkbench: FC = () => {
  return (
    <>
      <div className="web-broker-workbench">
        <Dashboard />
        <Info />
      </div>
      <Data />
    </>
  )
}

export default BrokerWorkbench
