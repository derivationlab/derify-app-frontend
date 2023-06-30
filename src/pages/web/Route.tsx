import { isEmpty, isUndefined } from 'lodash'
import { useAccount } from 'wagmi'

import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { checkMarginToken } from '@/api'
import Spinner from '@/components/common/Spinner'
import BrokerConnect from '@/pages/web/Broker/c/Connect'
import { useMarginTokenStore, useBrokerInfoStore } from '@/store'
import { MarginTokenState } from '@/store/types'

export const R1 = (props: PropsWithChildren<any>) => {
  const params: any = useParams()
  const { address } = useAccount()
  const { children, pathKey } = props
  const [testing, testResult] = useState<boolean | null>(null)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)

  const _testing = async () => {
    const { data } = await checkMarginToken(params.id)
    testResult(!!data)
  }

  useEffect(() => {
    if (params.id) void _testing()
  }, [params.id])

  return useMemo(() => {
    if (testing === null) return <Spinner fixed />
    const content = testing ? children : <Redirect to={`/${marginToken.symbol}/${pathKey}`} />
    if (!address) return content
    return brokerBound ? content : <Redirect to="/broker/bind" />
  }, [testing, pathKey, address, marginToken, brokerBound])
}

export const R2 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (!isUndefined(brokerBound)) return brokerBound ? <Redirect to="/broker" /> : children
    return <Spinner fixed />
  }, [address, brokerBound])
}

export const R3 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (!isUndefined(brokerBound) && !isUndefined(brokerInfo)) {
      if (brokerInfo) return <Redirect to={`/${marginToken.symbol}/broker/workbench`} />
      if (brokerBound) return children
      return <Redirect to="/broker/bind" />
    }
    return <Spinner fixed />
  }, [address, brokerInfo, brokerBound, marginToken])
}

export const R4 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (!isUndefined(brokerBound) && !isUndefined(brokerInfo)) {
      if (!isEmpty(brokerInfo)) return <Redirect to={`/${marginToken.symbol}/broker/workbench`} />
      if (!isEmpty(brokerBound)) return <Redirect to="/broker" />
      return children
    }
    return <Spinner fixed />
  }, [address, brokerInfo, brokerBound, marginToken])
}

export const R5 = (props: PropsWithChildren<any>) => {
  const params: any = useParams()
  const { address } = useAccount()
  const { children, pathKey } = props
  const [testing, testResult] = useState<boolean | null>(null)
  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const _testing = async () => {
    const { data } = await checkMarginToken(params.id)
    testResult(!!data)
  }

  useEffect(() => {
    if (params.id) void _testing()
  }, [params.id])

  return useMemo(() => {
    if (testing === null) return <Spinner fixed />
    const content = testing ? children : <Redirect to={`/${marginToken.symbol}/${pathKey}`} />
    if (!address) return <BrokerConnect />
    if (!isUndefined(brokerInfo)) return brokerInfo ? content : <Redirect to="/broker" />
    return <Spinner fixed />
  }, [address, pathKey, testing, brokerInfo, marginToken])
}

export const R6 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (!isUndefined(brokerInfo))
      return brokerInfo ? <Redirect to={`/${marginToken.symbol}/broker/workbench`} /> : children
    return <Spinner fixed />
  }, [address, brokerInfo, marginToken])
}

export const R7 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (!isUndefined(brokerInfo))
      return brokerInfo?.is_enable ? <Redirect to={`/${marginToken.symbol}/broker/workbench`} /> : children
    return <Spinner fixed />
  }, [address, brokerInfo, marginToken])
}

export const R8 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    if (!isUndefined(brokerInfo)) return brokerInfo ? children : <Redirect to="/broker/bind" />
    return <Spinner fixed />
  }, [address, brokerInfo])
}

export const routingWithMarginInfo = [
  '/data',
  '/earn',
  '/trade',
  '/broker/rank',
  '/broker/workbench',
  '/mining/rank',
  '/competition/rank',
  '/competition/rank',
  '/system/parameters'
]
