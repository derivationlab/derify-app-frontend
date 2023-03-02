import React, { lazy, Suspense } from 'react'

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

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  useInitialDAT()

  // todo 临时位置，后面要转移到 broker
  // useBrokerInfo((state) => state.b)
  const _getBrokerInfo = async (trader: string) => {
    const staking = await getBrokerInfo(trader)
    // updateStakingInfo(staking)
  }

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
