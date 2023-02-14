import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'

import { useMatchConf } from '@/hooks/useMatchConf'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { usePosDATStore } from '@/zustand/usePosDAT'

import Tabs, { TabPane } from '@/components/common/Tabs'

import MyOrder from './MyOrder'
import MyPosition from './MyPosition'
import TradeHistory from './TradeHistory'

const Data: FC = () => {
  const { t } = useTranslation()
  const { data } = useAccount()

  const fetchTraderPos = usePosDATStore((state) => state.fetch)

  const { spotPrice, factoryConfig, protocolConfig } = useMatchConf()

  useEffect(() => {
    if (data?.address && factoryConfig && protocolConfig)
      void fetchTraderPos(data?.address, factoryConfig, protocolConfig.exchange, spotPrice)
  }, [factoryConfig, protocolConfig, data?.address, spotPrice])

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
