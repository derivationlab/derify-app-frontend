import { isEmpty } from 'lodash'
import { Redirect } from 'react-router-dom'
import { useAccount } from 'wagmi'
import React, { PropsWithChildren, useMemo } from 'react'

import { useBrokerInfo } from '@/zustand/useBrokerInfo'
import { useMTokenFromRoute } from '@/hooks/useTrading'

import Loading from '@/components/common/Loading'
import BrokerConnect from '@/pages/web/Broker/c/Connect'

export const RConnectWallet = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    return children
  }, [address])
}

export const RBrokerProfile = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerBoundLoaded) {
      if (!isEmpty(brokerBound)) {
        return <Redirect to="/broker" />
      }
      return children
    }
    return <Loading show type="fixed" />
  }, [address, brokerBound, brokerBoundLoaded])
}

export const RWithMarToken = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children, pathKey } = props

  const { find, marginToken } = useMTokenFromRoute()

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    const out = find ? children : <Redirect to={`/${marginToken}/${pathKey}`} />
    if (!address) return out
    if (brokerBoundLoaded) {
      if (!isEmpty(brokerBound)) return out
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [find, address, pathKey, marginToken, brokerBound, brokerBoundLoaded])
}

export const RBrokerBound = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children, pathKey } = props

  const { marginToken, find } = useMTokenFromRoute()

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerInfoLoaded && brokerBoundLoaded) {
      if (!isEmpty(brokerInfo)) {
        return <Redirect to={`/${marginToken}/broker/workbench`} />
      }
      if (!isEmpty(brokerBound)) {
        return pathKey ? find ? children : <Redirect to={`/${marginToken}/${pathKey}`} /> : children
      }
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [find, address, pathKey, brokerInfo, brokerBound, marginToken, brokerInfoLoaded, brokerBoundLoaded])
}

export const RBrokerToBind = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props
  const { marginToken } = useMTokenFromRoute()

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerBoundLoaded && brokerInfoLoaded) {
      if (!isEmpty(brokerBound)) return <Redirect to="/broker" />
      if (!isEmpty(brokerInfo)) return <Redirect to={`/${marginToken}/broker/workbench`} />
      return children
    }
    return <Loading show type="fixed" />
  }, [address, brokerInfo, brokerInfoLoaded, brokerBound, marginToken, brokerBoundLoaded])
}

export const RBrokerList = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props
  const { marginToken } = useMTokenFromRoute()

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerBoundLoaded) {
      if (!isEmpty(brokerBound)) return <Redirect to="/broker" />
      return children
    }
    return <Loading show type="fixed" />
  }, [address, brokerBound, marginToken, brokerBoundLoaded])
}

export const RBrokerWorkbench = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children, pathKey } = props

  const { find, marginToken } = useMTokenFromRoute()

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerInfoLoaded) {
      if (!isEmpty(brokerInfo)) {
        return pathKey ? find ? children : <Redirect to={`/${marginToken}/${pathKey}`} /> : children
      }
      return <Redirect to="/broker" />
    }
    return <Loading show type="fixed" />
  }, [find, address, pathKey, brokerInfo, marginToken, brokerInfoLoaded])
}

export const RBrokerSignUpStep1_2 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props
  const { marginToken } = useMTokenFromRoute()

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerInfoLoaded) {
      if (!isEmpty(brokerInfo)) return <Redirect to={`/${marginToken}/broker/workbench`} />
      return children
    }
    return <Loading show type="fixed" />
  }, [address, brokerInfo, marginToken, brokerInfoLoaded])
}

export const RBrokerSignUpStep3 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerInfoLoaded) {
      if (!isEmpty(brokerInfo)) return children
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [address, brokerInfo, brokerInfoLoaded])
}
