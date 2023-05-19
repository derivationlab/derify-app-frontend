import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'

import React, { PropsWithChildren, useMemo } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import Loading from '@/components/common/Loading'
import Spinner from '@/components/common/Spinner'
import { findMarginToken } from '@/config/tokens'
import BrokerConnect from '@/pages/web/Broker/c/Connect'
import { useMarginTokenStore, useBrokerInfoStore } from '@/store'

export const RBrokerList = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfoStore((state) => state.brokerBoundLoaded)

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

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const brokerInfoLoaded = useBrokerInfoStore((state) => state.brokerInfoLoaded)
  const brokerBoundLoaded = useBrokerInfoStore((state) => state.brokerBoundLoaded)

  const find = useMemo(() => {
    if (params?.id) return findMarginToken(params.id)
  }, [params?.id])

  return useMemo(() => {
    console.info(brokerInfo)
    if (!address) return <BrokerConnect />
    if (brokerInfoLoaded && brokerBoundLoaded) {
      if (!isEmpty(brokerInfo)) {
        return <Redirect to={`/${marginToken.symbol}/broker/workbench`} />
      }
      if (!isEmpty(brokerBound)) {
        return pathKey ? find ? children : <Redirect to={`/${marginToken.symbol}/${pathKey}`} /> : children
      }
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [find, address, pathKey, brokerInfo, brokerBound, marginToken, brokerInfoLoaded, brokerBoundLoaded])
}

export const RWithMarToken = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children, pathKey } = props

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfoStore((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (!address) return children
    if (brokerBoundLoaded) {
      if (!isEmpty(brokerBound)) return children
      return <Redirect to="/broker/bind" />
    }
    return <Spinner fixed />
  }, [address, pathKey, marginToken, brokerBound, brokerBoundLoaded])
}

export const RBrokerToBind = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props

  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const brokerInfoLoaded = useBrokerInfoStore((state) => state.brokerInfoLoaded)
  const brokerBoundLoaded = useBrokerInfoStore((state) => state.brokerBoundLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerBoundLoaded && brokerInfoLoaded) {
      if (!isEmpty(brokerBound)) return <Redirect to="/broker" />
      if (!isEmpty(brokerInfo)) return <Redirect to={`/${marginToken.symbol}/broker/workbench`} />
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

  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfoStore((state) => state.brokerBoundLoaded)

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

  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const brokerInfoLoaded = useBrokerInfoStore((state) => state.brokerInfoLoaded)

  const find = useMemo(() => {
    if (params?.id) return findMarginToken(params.id)
  }, [params?.id])

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerInfoLoaded) {
      if (!isEmpty(brokerInfo)) {
        return pathKey ? find ? children : <Redirect to={`/${marginToken.symbol}/${pathKey}`} /> : children
      }
      return <Redirect to="/broker" />
    }
    return <Loading show type="fixed" />
  }, [find, address, pathKey, brokerInfo, marginToken, brokerInfoLoaded])
}

export const RBrokerSignUpStep1 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const brokerInfoLoaded = useBrokerInfoStore((state) => state.brokerInfoLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerInfoLoaded) {
      if (!isEmpty(brokerInfo)) return <Redirect to={`/${marginToken.symbol}/broker/workbench`} />
      return children
    }
    return <Loading show type="fixed" />
  }, [address, brokerInfo, marginToken, brokerInfoLoaded])
}

export const RBrokerSignUpStep2 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const brokerInfoLoaded = useBrokerInfoStore((state) => state.brokerInfoLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerInfoLoaded) {
      if (brokerInfo?.is_enable) return <Redirect to={`/${marginToken.symbol}/broker/workbench`} />
      return children
    }
    return <Loading show type="fixed" />
  }, [address, brokerInfo, marginToken, brokerInfoLoaded])
}

export const RBrokerSignUpStep3 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()

  const { children } = props

  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const brokerInfoLoaded = useBrokerInfoStore((state) => state.brokerInfoLoaded)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (brokerInfoLoaded) {
      if (!isEmpty(brokerInfo)) return children
      return <Redirect to="/broker/bind" />
    }
    return <Loading show type="fixed" />
  }, [address, brokerInfo, brokerInfoLoaded])
}
