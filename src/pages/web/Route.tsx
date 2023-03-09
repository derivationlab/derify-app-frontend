import { isEmpty } from 'lodash'
import { Redirect } from 'react-router-dom'
import { useAccount } from 'wagmi'
import React, { PropsWithChildren, useMemo } from 'react'

import { useBrokerInfo } from '@/zustand/useBrokerInfo'
import { useMTokenForRoute } from '@/hooks/useTrading'

import Loading from '@/components/common/Loading'

export const R0 = (props: PropsWithChildren<any>) => {
  const { data } = useAccount()
  const { children, pathKey } = props

  const { find, marginToken } = useMTokenForRoute()

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (!data?.address) return children
    if (brokerBoundLoaded) {
      if (!isEmpty(brokerBound)) {
        return find ? children : <Redirect to={`/${marginToken}/${pathKey}`} />
      }
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [find, data, pathKey, marginToken, brokerBound, brokerBoundLoaded])
}

export const R1 = (props: PropsWithChildren<any>) => {
  const { children, pathKey } = props

  const { marginToken, find } = useMTokenForRoute()

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (brokerInfoLoaded && brokerBoundLoaded) {
      if (!isEmpty(brokerInfo)) {
        return <Redirect to={`/${marginToken}/broker/workbench`} />
      }
      if (!isEmpty(brokerBound)) {
        return pathKey ? (
          find ? (
            children
          ) : (
            <Redirect to={`/${marginToken}/${pathKey}`} />
          )
        ) : (
          <Redirect to={`/${pathKey}`} />
        )
      }
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [find, pathKey, brokerInfo, brokerBound, marginToken, brokerInfoLoaded, brokerBoundLoaded])
}

export const R2 = (props: PropsWithChildren<any>) => {
  const { children, pathKey } = props

  const { marginToken, find } = useMTokenForRoute()

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (brokerBoundLoaded) {
      if (!isEmpty(brokerBound)) {
        return <Redirect to="/broker" />
      }
      return pathKey ? (
        find ? (
          children
        ) : (
          <Redirect to={`/${marginToken}/${pathKey}`} />
        )
      ) : (
        <Redirect to={`/${pathKey}`} />
      )
    }
    return <Loading show type="fixed" />
  }, [find, pathKey, brokerBound, marginToken, brokerBoundLoaded])
}

export const R3 = (props: PropsWithChildren<any>) => {
  const { children, pathKey } = props

  const { find, marginToken } = useMTokenForRoute()

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)

  return useMemo(() => {
    if (brokerInfoLoaded) {
      if (!isEmpty(brokerInfo)) {
        return pathKey ? (
          find ? (
            children
          ) : (
            <Redirect to={`/${marginToken}/${pathKey}`} />
          )
        ) : (
          <Redirect to={`/${pathKey}`} />
        )
      }
      return <Redirect to="/broker" />
    }
    return <Loading show type="fixed" />
  }, [find, pathKey, brokerInfo, marginToken, brokerInfoLoaded])
}
