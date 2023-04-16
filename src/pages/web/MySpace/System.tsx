import Table from 'rc-table'
import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMarginTokenStore } from '@/store'

const System: FC = () => {
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const { t } = useTranslation()

  const isLoading = false

  const [systemRelevantData] = useState([
    { parameters: t('Nav.SystemParameters.OpenClosePositionLimit'), value: '2' },
    { parameters: t('Nav.SystemParameters.BuybackFundRatio'), value: '20%' },
    { parameters: t('Nav.SystemParameters.MinPositionValue'), value: '500' },
    { parameters: t('Nav.SystemParameters.MMRMaintenanceMarginRatio'), value: '1%' },
    { parameters: t('Nav.SystemParameters.LMRLiquidationMarginRatio'), value: '0.5%' },
    { parameters: t('Nav.SystemParameters.MultiplierofMMRAfterADL'), value: '2' },
    { parameters: t('Nav.SystemParameters.iAPRofbToken'), value: '10%' },
    { parameters: t('Nav.SystemParameters.eDRFMintperblock'), value: '0.00003472' },
    { parameters: t('Nav.SystemParameters.BrokerPrivilegeFeeeDRF'), value: '60,000' },
    { parameters: t('Nav.SystemParameters.eDRFforbrokerprivilegeperblock'), value: '0.02083333' },
    { parameters: t('Nav.SystemParameters.MultiplierofGasFee'), value: '1.5' },
    { parameters: t('Nav.SystemParameters.Buybackcycleblocks'), value: '30,000' },
    { parameters: t('Nav.SystemParameters.BuybackSlippageTolerance'), value: '2%' },
    { parameters: t('Nav.SystemParameters.MinGrantDRFspositionmining'), value: '1000' },
    { parameters: t('Nav.SystemParameters.MinGrantDRFsbroker'), value: '1000' }
  ])

  const [tradingToken] = useState([
    { parameters: t('Nav.SystemParameters.kPCFRate'), value: '1,000' },
    { parameters: t('Nav.SystemParameters.yPCFRate'), value: '300,000,000' },
    { parameters: t('Nav.SystemParameters.PCF'), value: '0.12%' },
    { parameters: t('Nav.SystemParameters.TradingFeeRatio'), value: '0.1%' },
    { parameters: t('Nav.SystemParameters.Maxlimitorders'), value: '10' },
    { parameters: t('Nav.SystemParameters.Maxleverage'), value: '75' }
  ])

  const webColumns = [
    {
      title: t('Nav.SystemParameters.Parameters'),
      dataIndex: 'parameters',
      width: '60%'
    },
    {
      title: t('Nav.SystemParameters.Value'),
      dataIndex: 'value'
    }
  ]

  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    return ''
  }, [isLoading])

  return (
    <div className="web-table-page">
      <div className="web-system-title">
        {t('Nav.SystemParameters.SystemParameters')}-{marginToken}
      </div>
      <header className="web-table-page-header">
        <h3>{t('Nav.SystemParameters.SystemRelevant')}</h3>
      </header>
      <Table
        className="web-broker-table"
        emptyText={memoEmptyText}
        // @ts-ignore
        columns={webColumns}
        data={systemRelevantData}
        rowKey="parameters"
      />
      <header className="web-table-page-header">
        <h3>{t('Nav.SystemParameters.TradingToken')}</h3>
      </header>
      <Table
        className="web-broker-table"
        emptyText={memoEmptyText}
        // @ts-ignore
        columns={webColumns}
        data={tradingToken}
        rowKey="parameters"
      />
    </div>
  )
}

export default System
