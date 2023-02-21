import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'
import PubSub from 'pubsub-js'

import { PubSubEvents } from '@/typings'
import { useFactoryConf } from '@/hooks/useMatchConf'
import { usePosDATStore } from '@/zustand/usePosDAT'

import Tabs, { TabPane } from '@/components/common/Tabs'

import MyOrder from './MyOrder'
import MyPosition from './MyPosition'
import TradeHistory from './TradeHistory'

const Data: FC = () => {
  const { t } = useTranslation()
  const { data } = useAccount()

  const fetchTraderPos = usePosDATStore((state) => state.fetch)

  const { factoryConfig } = useFactoryConf()

  useEffect(() => {
    if (data?.address && factoryConfig) void fetchTraderPos(data?.address, factoryConfig)
  }, [factoryConfig, data?.address])

  useEffect(() => {
    PubSub.subscribe(PubSubEvents.UPDATE_OPENED_POSITION, () => {
      if (data?.address && factoryConfig) void fetchTraderPos(data?.address, factoryConfig)
    })

    return () => {
      PubSub.clearAllSubscriptions()
    }
  }, [])

  return (
    <Tabs className="web-trade-data">
      <TabPane className="web-trade-data-pane" tab={t('Trade.MyPosition.MyPosition', 'My Position')} key="Position">
        {/* @ts-ignore */}
        <MyPosition />
      </TabPane>
      <TabPane className="web-trade-data-pane" tab={t('Trade.MyOrder.MyOrder', 'My Order')} key="Order">
        <MyOrder />
      </TabPane>
      <TabPane
        className="web-trade-data-pane"
        tab={t('Trade.TradeHistory.TradeHistory', 'Trade History')}
        key="History"
      >
        <TradeHistory />
      </TabPane>
    </Tabs>
  )
}

export default Data
