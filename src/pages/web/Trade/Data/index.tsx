import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'

import { usePosDATStore } from '@/zustand/usePosDAT'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useConfigInfo, useMarginToken, usePairsInfo, useQuoteToken } from '@/zustand'

import Tabs, { TabPane } from '@/components/common/Tabs'

import MyOrder from './MyOrder'
import MyPosition from './MyPosition'
import TradeHistory from './TradeHistory'

const Data: FC = () => {
  const { t } = useTranslation()
  const { data } = useAccount()

  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)
  const fetchTraderPos = usePosDATStore((state) => state.fetch)
  const spotPrices = usePairsInfo((state) => state.spotPrices)
  const variables = useTraderInfo((state) => state.variables)

  useEffect(() => {
    if (data?.address
      && factoryConfigLoaded
      && factoryConfig
      && protocolConfigLoaded
      && protocolConfig
    ) void fetchTraderPos(data?.address,
      factoryConfig[marginToken][quoteToken],
      protocolConfig[marginToken].exchange,
      spotPrices[marginToken][quoteToken],
      variables)
  }, [factoryConfig, factoryConfigLoaded, protocolConfig, protocolConfigLoaded, data?.address, spotPrices, marginToken, quoteToken, variables])

  return (
    <Tabs className='web-trade-data'>
      <TabPane className='web-trade-data-pane' tab={t('Trade.MyPosition.MyPosition', 'My Position')} key='Position'>
        <MyPosition />
      </TabPane>
      <TabPane className='web-trade-data-pane' tab={t('Trade.MyOrder.MyOrder', 'My Order')} key='Order'>
        <MyOrder />
      </TabPane>
      <TabPane
        className='web-trade-data-pane'
        tab={t('Trade.TradeHistory.TradeHistory', 'Trade History')}
        key='History'
      >
        <TradeHistory />
      </TabPane>
    </Tabs>
  )
}

export default Data
