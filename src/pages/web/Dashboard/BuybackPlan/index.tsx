import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Tabs, { TabPane } from '@/components/common/Tabs'
import { useMarginPriceFeed } from '@/hooks/useAllMarginPrice'
import Table1 from '@/pages/web/Dashboard/BuybackPlan/Table1'
import Table2 from '@/pages/web/Dashboard/BuybackPlan/Table2'
import { useMarginTokenListStore } from '@/store'

import Data from './Data'

const BuybackPlan = () => {
  const { t } = useTranslation()
  const [activeKey, setActiveKey] = useState('BuybackPlan')
  const allMarginTokenList = useMarginTokenListStore((state) => state.allMarginTokenList)
  const { priceFeed } = useMarginPriceFeed(allMarginTokenList)

  return (
    <div className="web-dashboard">
      <Data priceFeed={priceFeed} allMarginTokenList={allMarginTokenList} />
      <div className="web-dashboard-plan-list">
        <Tabs className="web-dashboard-plan-tabs" activeKey={activeKey} onChange={(key: string) => setActiveKey(key)}>
          <TabPane tab={t('NewDashboard.BuybackPlan.BuybackPlan')} key="BuybackPlan">
            {activeKey === 'BuybackPlan' && <Table1 priceFeed={priceFeed} allMarginTokenList={allMarginTokenList} />}
          </TabPane>
          <TabPane tab={t('NewDashboard.BurnHistory.BurnHistory')} key="BurnHistory">
            {activeKey === 'BurnHistory' && <Table2 />}
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default BuybackPlan
