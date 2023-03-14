import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo } from 'react'

import { PubSubEvents } from '@/typings'
import { useConfigInfo } from '@/zustand'
import { usePosDATStore } from '@/zustand/usePosDAT'
import { useMTokenFromRoute } from '@/hooks/useTrading'

import Tabs, { TabPane } from '@/components/common/Tabs'

import MyOrder from './MyOrder'
import MyPosition from './MyPosition'
import TradeHistory from './TradeHistory'

const Data: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const fetchTraderPos = usePosDATStore((state) => state.fetch)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)

  const marginToken = useMTokenFromRoute()

  const _factoryConfig = useMemo(() => {
    if (factoryConfigLoaded && factoryConfig) return factoryConfig[marginToken]
  }, [marginToken, factoryConfig, factoryConfigLoaded])

  useEffect(() => {
    if (address && _factoryConfig) void fetchTraderPos(address, _factoryConfig)
  }, [_factoryConfig, address])

  useEffect(() => {
    PubSub.subscribe(PubSubEvents.UPDATE_OPENED_POSITION, () => {
      if (address && _factoryConfig) {
        void fetchTraderPos(address, _factoryConfig)
      }
    })
  }, [factoryConfig, address])

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
