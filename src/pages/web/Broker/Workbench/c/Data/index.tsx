import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Tabs, { TabPane } from '@/components/common/Tabs'

import History from './History'
import Trader from './Trader'
import Transaction from './Transaction'

const Data: FC = () => {
  const { t } = useTranslation()

  const [activeKey, setActiveKey] = useState('History')

  return (
    <Tabs className="web-broker-workbench-data" activeKey={activeKey} onChange={(key: string) => setActiveKey(key)}>
      <TabPane tab={t('Broker.History.History', 'History')} key="History">
        <History />
      </TabPane>
      <TabPane tab={t('Broker.Transaction.Transaction', 'Transaction')} key="Transaction">
        <Transaction />
      </TabPane>
      <TabPane tab={t('Broker.Trader.Trader', 'Trader')} key="Trader">
        <Trader />
      </TabPane>
    </Tabs>
  )
}

export default Data
