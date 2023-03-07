import { isEmpty } from 'lodash'
import { Redirect } from 'react-router-dom'
import { useAccount } from 'wagmi'
import React, { PropsWithChildren, useMemo } from 'react'

import { useBrokerInfo } from '@/zustand/useBrokerInfo'
import { useMTokenForRoute } from '@/hooks/useTrading'

import Loading from '@/components/common/Loading'

export const TradingRoute = (props: PropsWithChildren<any>) => {
  const { data } = useAccount()
  const { children } = props

  const { find, marginToken } = useMTokenForRoute()

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (!data?.address) return children
    if (brokerBoundLoaded) {
      if (!isEmpty(brokerBound)) {
        return find ? children : <Redirect to={`/${marginToken}/trade`} />
      }
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [brokerBoundLoaded, brokerBound, find, marginToken])
}

export const BrokerBindRoute = (props: PropsWithChildren<any>) => {
  const { children } = props

  const { find, marginToken } = useMTokenForRoute()

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (brokerBoundLoaded) {
      if (!isEmpty(brokerBound)) {
        return find ? children : <Redirect to={`/${marginToken}/trade`} />
      }
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [brokerBoundLoaded, brokerBound, find, marginToken])
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
