import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect } from 'react'

import { PubSubEvents } from '@/typings'
import { useClearingParams } from '@/hooks/useSysParams'
import { useFactoryConf, useProtocolConf } from '@/hooks/useMatchConf'
import { useMarginTokenStore, useSysParamsStore, usePositionStore } from '@/store'

import Tabs, { TabPane } from '@/components/common/Tabs'

import MyOrder from './MyOrder'
import MyPosition from './MyPosition'
import TradeHistory from './TradeHistory'

const Data: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const fetchTraderPos = usePositionStore((state) => state.fetch)
  const updateSysParams = useSysParamsStore((state) => state.updateSysParams)

  const { protocolConfig } = useProtocolConf(marginToken)
  const { match: factoryConfig } = useFactoryConf(marginToken)
  const { data: clearingParams, refetch: refetchClearingParams } = useClearingParams(protocolConfig?.clearing)

  useEffect(() => {
    if (protocolConfig) void refetchClearingParams()
  }, [protocolConfig])

  useEffect(() => {
    if (clearingParams) updateSysParams(clearingParams as any)
  }, [clearingParams])

  useEffect(() => {
    if (address && factoryConfig) void fetchTraderPos(address, factoryConfig)

    PubSub.subscribe(PubSubEvents.UPDATE_OPENED_POSITION, () => {
      if (address && factoryConfig) void fetchTraderPos(address, factoryConfig)
    })
  }, [address, factoryConfig])

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
