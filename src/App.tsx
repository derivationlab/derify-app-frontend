import React, { lazy, Suspense, useEffect } from 'react'

import 'rc-dialog/assets/index.css'
import 'rc-collapse/assets/index.css'
import 'rc-tabs/assets/index.css'
import 'rc-table/assets/index.css'

import { useInitialDAT } from '@/hooks/useInitialDAT'
import { Switch, Route } from '@/components/common/Route'

import '@/style/style.scss'
import { useInitialEffect } from '@/hooks/useInitialEffect'
import { getBrokerInfo, getTraderStakingDAT } from '@/hooks/helper'
import { useBrokerInfo } from '@/zustand/useBrokerInfo'
import { useInterval } from 'react-use'
import { useAccount } from 'wagmi'
import { useBrokerParams } from '@/hooks/useBroker'
import { useConfigInfo } from '@/zustand'
import PubSub from 'pubsub-js'
import { PubSubEvents } from '@/typings'

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  useInitialDAT()

  // todo 临时位置，后面要转移到 broker
  const { data: account } = useAccount()
  const { data: brokerParams, isLoading } = useBrokerParams()
  const updateBrokerAssets = useBrokerInfo((state) => state.updateBrokerAssets)
  const updateBrokerParams = useConfigInfo((state) => state.updateBrokerParams)
  const fetchBrokerInfo = useBrokerInfo((state) => state.fetchBrokerInfo)
  const fetchBrokerBound = useBrokerInfo((state) => state.fetchBrokerBound)
  const _getBrokerInfo = async (trader: string) => {
    const staking = await getBrokerInfo(trader)
    updateBrokerAssets(staking)
  }

  useEffect(() => {
    if (account?.address) {
      void _getBrokerInfo(account?.address)
      void fetchBrokerInfo(account?.address)
      void fetchBrokerBound(account?.address)
    }
  }, [account?.address])
  useInterval(() => {
    if (account?.address) {
      void _getBrokerInfo(account?.address)
    }
  }, 6000)
  useEffect(() => {
    if (!isLoading && brokerParams) {
      updateBrokerParams(brokerParams)
    }
  }, [brokerParams, isLoading])
  useEffect(() => {
    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_DAT, () => {
      if (account?.address) {
        void fetchBrokerInfo(account.address)
      }
    })

    return () => {
      PubSub.clearAllSubscriptions()
    }
  }, [account?.address])
  // todo 临时位置，后面要转移到 broker--end

  return (
    <>
      <Suspense fallback={null}>
        <Switch>
          <Route path="/" component={WebEntry} />
        </Switch>
      </Suspense>
    </>
  )
}

export default App
