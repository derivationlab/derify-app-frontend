import React, { FC } from 'react'

import Dashboard from './c/Dashboard'
import Info from './c/Info'
import Data from './c/Data'

const BrokerWorkbench: FC = () => {
  return (
    <>
      <div className="web-broker-workbench">
        {/*<Dashboard />*/}
        {/*<Info />*/}
      </div>
      <Data />
    </>
  )
}

export default BrokerWorkbench
