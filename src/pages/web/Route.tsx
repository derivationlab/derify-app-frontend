import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { Redirect, useParams } from 'react-router-dom'
import React, { PropsWithChildren, useMemo } from 'react'

import { useBrokerInfo } from '@/store/useBrokerInfo'
import { useMarginToken } from '@/store'
import { findMarginToken } from '@/config/tokens'

import Loading from '@/components/common/Loading'
import BrokerConnect from '@/pages/web/Broker/c/Connect'

export const RBrokerList = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props

  const marginToken = useMarginToken((state) => state.marginToken)
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

export const RBrokerBound = (props: PropsWithChildren<any>) => {
  const params: any = useParams()

  const { address } = useAccount()
  const { children, pathKey } = props

  const marginToken = useMarginToken((state) => state.marginToken)

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  const find = useMemo(() => {
    if (params?.id) return findMarginToken(params.id)
  }, [params?.id])

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

export const RWithMarToken = (props: PropsWithChildren<any>) => {
  const params: any = useParams()

  const { address } = useAccount()
  const { children, pathKey } = props

  const marginToken = useMarginToken((state) => state.marginToken)
  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  const find = useMemo(() => {
    if (params?.id) return findMarginToken(params.id)
  }, [params?.id])

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

export const RBrokerToBind = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const marginToken = useMarginToken((state) => state.marginToken)
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

export const RBrokerWorkbench = (props: PropsWithChildren<any>) => {
  const params: any = useParams()

  const { address } = useAccount()
  const { children, pathKey } = props

  const marginToken = useMarginToken((state) => state.marginToken)
  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerInfoLoaded = useBrokerInfo((state) => state.brokerInfoLoaded)

  const find = useMemo(() => {
    if (params?.id) return findMarginToken(params.id)
  }, [params?.id])

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

  const marginToken = useMarginToken((state) => state.marginToken)
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
