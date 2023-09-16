import { useAtomValue } from 'jotai'
import { isEmpty, isUndefined } from 'lodash'
import { useAccount } from 'wagmi'

import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { checkMarginToken } from '@/api'
import { userBrokerBoundAtom, whetherUserIsBrokerAtom } from '@/atoms/useBrokerData'
import Spinner from '@/components/common/Spinner'
import NotConnect from '@/components/web/NotConnect'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'

export const R1 = (props: PropsWithChildren<any>) => {
  const params: any = useParams()
  const { address } = useAccount()
  const { children, pathKey } = props
  const [testing, testResult] = useState<boolean | null>(null)
  const userBrokerBound = useAtomValue(userBrokerBoundAtom)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const _testing = async () => {
    const { data } = await checkMarginToken(params.id)
    testResult(!!data)
  }

  useEffect(() => {
    if (params.id) void _testing()
  }, [params.id])

  return useMemo(() => {
    if (!address) {
      if (testing === null) return <Spinner fixed />
      return testing ? children : <Redirect to={`/${marginToken.symbol}/${pathKey}`} />
    }
    if (testing === null || userBrokerBound === undefined) return <Spinner fixed />
    const content = testing ? children : <Redirect to={`/${marginToken.symbol}/${pathKey}`} />
    if (!address) return content
    return userBrokerBound ? content : <Redirect to="/broker/bind" />
  }, [testing, pathKey, address, marginToken, userBrokerBound])
}

export const R2 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const userBrokerBound = useAtomValue(userBrokerBoundAtom)

  return useMemo(() => {
    if (!address) return <NotConnect />
    if (!isUndefined(userBrokerBound)) return userBrokerBound ? <Redirect to="/broker" /> : children
    return <Spinner fixed />
  }, [address, userBrokerBound])
}

export const R3 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const userBrokerBound = useAtomValue(userBrokerBoundAtom)
  const whetherUserIsBroker = useAtomValue(whetherUserIsBrokerAtom)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  return useMemo(() => {
    if (!address) return <NotConnect />
    if (!isUndefined(userBrokerBound) && !isUndefined(whetherUserIsBroker)) {
      if (whetherUserIsBroker) return <Redirect to={`/${marginToken.symbol}/broker/workbench`} />
      if (!isEmpty(userBrokerBound)) return children
      return <Redirect to="/broker/bind" />
    }
    return <Spinner fixed />
  }, [address, marginToken, userBrokerBound, whetherUserIsBroker])
}

export const R4 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const userBrokerBound = useAtomValue(userBrokerBoundAtom)
  const whetherUserIsBroker = useAtomValue(whetherUserIsBrokerAtom)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  return useMemo(() => {
    if (!address) return <NotConnect />
    if (!isUndefined(userBrokerBound) && !isUndefined(whetherUserIsBroker)) {
      if (whetherUserIsBroker) return <Redirect to={`/${marginToken.symbol}/broker/workbench`} />
      if (!isEmpty(userBrokerBound)) return <Redirect to="/broker" />
      return children
    }
    return <Spinner fixed />
  }, [address, marginToken, userBrokerBound, whetherUserIsBroker])
}

export const R5 = (props: PropsWithChildren<any>) => {
  const params: any = useParams()
  const { address } = useAccount()
  const { children, pathKey } = props
  const [testing, testResult] = useState<boolean | null>(null)
  const whetherUserIsBroker = useAtomValue(whetherUserIsBrokerAtom)
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
    if (!address) return <NotConnect />
    if (!isUndefined(whetherUserIsBroker)) return whetherUserIsBroker ? content : <Redirect to="/broker" />
    return <Spinner fixed />
  }, [address, pathKey, testing, marginToken, whetherUserIsBroker])
}

export const R6 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const whetherUserIsBroker = useAtomValue(whetherUserIsBrokerAtom)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  return useMemo(() => {
    if (!address) return <NotConnect />
    if (!isUndefined(whetherUserIsBroker))
      return whetherUserIsBroker ? <Redirect to={`/${marginToken.symbol}/broker/workbench`} /> : children
    return <Spinner fixed />
  }, [address, marginToken, whetherUserIsBroker])
}

export const R7 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const whetherUserIsBroker = useAtomValue(whetherUserIsBrokerAtom)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  /**
   * todo: is_enable
   */
  return useMemo(() => {
    if (!address) return <NotConnect />
    if (!isUndefined(whetherUserIsBroker))
      return whetherUserIsBroker ? <Redirect to={`/${marginToken.symbol}/broker/workbench`} /> : children
    return <Spinner fixed />
  }, [address, marginToken, whetherUserIsBroker])
}

export const R8 = (props: PropsWithChildren<any>) => {
  const { address } = useAccount()
  const { children } = props
  const whetherUserIsBroker = useAtomValue(whetherUserIsBrokerAtom)

  return useMemo(() => {
    if (!address) return <NotConnect />
    if (!isUndefined(whetherUserIsBroker)) return whetherUserIsBroker ? children : <Redirect to="/broker/bind" />
    return <Spinner fixed />
  }, [address, whetherUserIsBroker])
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
