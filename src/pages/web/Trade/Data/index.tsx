import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Tabs, { TabPane } from '@/components/common/Tabs'
import { useOwnedPositionsBackUp } from '@/hooks/useOwnedPositions'
import { useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { PubSubEvents } from '@/typings'

import MyOrder from './MyOrder'
import MyPosition from './MyPosition'
import TradeHistory from './TradeHistory'

const Data: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const { loaded, ownedPositions, getOwnedPositions } = useOwnedPositionsBackUp(
    address,
    protocolConfig?.factory,
    marginToken.address
  )

  useEffect(() => {
    PubSub.unsubscribe(PubSubEvents.UPDATE_OPENED_POSITION)
    PubSub.subscribe(PubSubEvents.UPDATE_OPENED_POSITION, () => {
      if (address && protocolConfig) void getOwnedPositions(address, protocolConfig.factory, marginToken.address)
    })
  }, [address, marginToken, protocolConfig])

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
