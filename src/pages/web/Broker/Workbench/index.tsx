import React, { FC, useEffect } from 'react'

import { getIndicatorDataAsync } from '@/store/constant'
import { useAppDispatch } from '@/store'

import Dashboard from './c/Dashboard'
import Info from './c/Info'
import Data from './c/Data'

const BrokerWorkbench: FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getIndicatorDataAsync())
  }, [])

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
