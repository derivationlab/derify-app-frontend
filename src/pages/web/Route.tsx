import { isEmpty } from 'lodash'
import { Redirect, useLocation } from 'react-router-dom'
import React, { PropsWithChildren, useMemo } from 'react'

import { useBrokerInfo } from '@/zustand/useBrokerInfo'

import Loading from '@/components/common/Loading'

export const BrokerBindRoute = (props: PropsWithChildren<any>) => {
  const { children } = props
  const { pathname } = useLocation()

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (brokerBoundLoaded) {
      if (!isEmpty(brokerBound)) return children
      return <Redirect to="/broker-bind" />
    }
    return <Loading show type="fixed" />
  }, [brokerBoundLoaded, brokerBound, pathname])
}

export const BWorkbenchRoute = (props: PropsWithChildren<any>) => {
  const { children } = props

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (brokerInfoLoaded && brokerBoundLoaded) {
      // if (!isEmpty(brokerInfo)) {
      //   console.info(brokerInfo)
      //   return (<Redirect to='/broker/workbench' />)
      // }
      console.info(children)
      if (!isEmpty(brokerBound)) return children
      return <Redirect to="/broker-bind" />
    }
    return <Loading show type="fixed" />
  }, [brokerInfoLoaded, brokerBoundLoaded, brokerInfo, brokerBound])
}
