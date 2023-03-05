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
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [brokerBoundLoaded, brokerBound, pathname])
}

export const BWorkbenchRoute = (props: PropsWithChildren<any>) => {
  const { children } = props

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerAssets = useBrokerInfo((state) => state.brokerAssets)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)
  const brokerAssetsLoaded = useBrokerInfo((state) => state.brokerAssetsLoaded)

  return useMemo(() => {
    if (brokerAssetsLoaded && brokerBoundLoaded) {
      if (brokerAssets?.isBroker) {
        return children
      } else if (!isEmpty(brokerBound)) {
        return <Redirect to="/broker" />
      }
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [brokerAssetsLoaded, brokerBoundLoaded, brokerAssets, brokerBound])
}
