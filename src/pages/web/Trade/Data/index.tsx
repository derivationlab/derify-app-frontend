import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'
import PubSub from 'pubsub-js'

import { PubSubEvents } from '@/typings'
import { usePosDATStore } from '@/zustand/usePosDAT'
import { useConfigInfo, useMarginToken } from '@/zustand'

import Tabs, { TabPane } from '@/components/common/Tabs'

import MyOrder from './MyOrder'
import MyPosition from './MyPosition'
import TradeHistory from './TradeHistory'

const Data: FC = () => {
  const { t } = useTranslation()
  const { data } = useAccount()

  const marginToken = useMarginToken((state) => state.marginToken)
  const fetchTraderPos = usePosDATStore((state) => state.fetch)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)

  const _factoryConfig = useMemo(() => {
    if (factoryConfigLoaded && factoryConfig) return factoryConfig[marginToken]
  }, [marginToken, factoryConfig, factoryConfigLoaded])

  useEffect(() => {
    if (data?.address && _factoryConfig) void fetchTraderPos(data?.address, _factoryConfig)
  }, [_factoryConfig, data?.address])

  useEffect(() => {
    PubSub.subscribe(PubSubEvents.UPDATE_OPENED_POSITION, () => {
      if (data?.address && _factoryConfig) {
        void fetchTraderPos(data?.address, _factoryConfig)
      }
    })

    return () => {
      PubSub.clearAllSubscriptions()
    }
  }, [factoryConfig, data?.address])

  return (
    <Tabs className="web-trade-data">
      <TabPane className="web-trade-data-pane" tab={t('Trade.MyPosition.MyPosition', 'My Position')} key="Position">
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
