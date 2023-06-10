import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Tabs, { TabPane } from '@/components/common/Tabs'
import { useOwnedPositions } from '@/hooks/useOwnedPositions'
import { useDerivativeListStore } from '@/store'
import { PubSubEvents } from '@/typings'

import MyOrder from './MyOrder'
import MyPosition from './MyPosition'
import TradeHistory from './TradeHistory'

const Data: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const derAddressList = useDerivativeListStore((state) => state.derAddressList)

  const { loaded, ownedPositions, getOwnedPositions } = useOwnedPositions(address, derAddressList)

  useEffect(() => {
    PubSub.unsubscribe(PubSubEvents.UPDATE_OPENED_POSITION)
    PubSub.subscribe(PubSubEvents.UPDATE_OPENED_POSITION, () => {
      if (address) void getOwnedPositions(address, derAddressList)
    })
  }, [address, derAddressList])

  return (
    <Tabs className="web-trade-data">
      <TabPane className="web-trade-data-pane" tab={t('Trade.MyPosition.MyPosition', 'My Position')} key="Position">
        <MyPosition data={ownedPositions?.positionOrd ?? []} loaded={loaded} />
      </TabPane>
      <TabPane className="web-trade-data-pane" tab={t('Trade.MyOrder.MyOrder', 'My Order')} key="Order">
        <MyOrder data={ownedPositions?.profitLossOrd ?? []} loaded={loaded} />
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
