import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Tabs, { TabPane } from '@/components/common/Tabs'
import { usePositionHoldStore, useDerivativeListStore, useQuoteTokenStore } from '@/store'
import { QuoteTokenState } from '@/store/types'
import { PubSubEvents } from '@/typings'

import MyOrder from './MyOrder'
import MyPosition from './MyPosition'
import TradeHistory from './TradeHistory'

const Data: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const fetchTraderPos = usePositionHoldStore((state) => state.fetch)
  const resetTraderPos = usePositionHoldStore((state) => state.reset)

  // todo 跟 max volume一样的问题
  useEffect(() => {
    if (address && derAddressList) void fetchTraderPos(address, derAddressList)
    PubSub.subscribe(PubSubEvents.UPDATE_OPENED_POSITION, () => {
      if (address && derAddressList) void fetchTraderPos(address, derAddressList)
    })
  }, [address, derAddressList])

  useEffect(() => {
    if (!quoteToken.address) void resetTraderPos({ loaded: true, positionOrd: [], profitLossOrd: [] })
    else void resetTraderPos({ loaded: false })
  }, [quoteToken])

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
