import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Tabs, { TabPane } from '@/components/common/Tabs'
import Table1 from '@/pages/web/Dashboard/BuybackPlan/Table1'
import Table2 from '@/pages/web/Dashboard/BuybackPlan/Table2'
import { useInitData } from '@/pages/web/Dashboard/BuybackPlan/hooks'

import Data from './Data'

const BuybackPlan = () => {
  const { t } = useTranslation()
  const [activeKey, setActiveKey] = useState('BuybackPlan')
  const { tokenPrice, buyBackInfo, marginPrices, blockNumber } = useInitData()

  return (
    <div className="web-dashboard">
      <Data tokenPrice={tokenPrice} blockNumber={blockNumber} buyBackInfo={buyBackInfo} marginPrices={marginPrices} />
      <div className="web-dashboard-plan-list">
        <Tabs className="web-dashboard-plan-tabs" activeKey={activeKey} onChange={(key: string) => setActiveKey(key)}>
          <TabPane tab={t('NewDashboard.BuybackPlan.BuybackPlan')} key="BuybackPlan">
            <Table1
              tokenPrice={tokenPrice}
              blockNumber={blockNumber}
              buyBackInfo={buyBackInfo}
              marginPrices={marginPrices}
            />
          </TabPane>
          <TabPane tab={t('NewDashboard.BurnHistory.BurnHistory')} key="BurnHistory">
            <Table2 />
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default BuybackPlan
