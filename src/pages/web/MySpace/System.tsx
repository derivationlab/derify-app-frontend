import React, { FC, useMemo, useState } from 'react'
import Table from 'rc-table'

// import { MarketInfoData as data } from './mockData'

const System: FC = () => {
  const isLoading = false

  const [systemRelevantData, setSystemRelevantData] = useState([
    { parameters: 'θ - Open/Close Position Limit', value: '2' },
    { parameters: 'x - Buyback Fund Ratio', value: '20%' },
    { parameters: 'Min Position Value(USD)', value: '500' },
    { parameters: 'MMR-Maintenance Margin Ratio', value: '1%' },
    { parameters: 'LMR-Liquidation Margin Ratio', value: '0.5%' },
    { parameters: 'n-Multiplier of MMR After ADL', value: '2' },
    { parameters: 'i-APR of bToken', value: '10%' },
    { parameters: 'eDRF Mint per block', value: '0.00003472' },
    { parameters: 'Broker Privilege Fee (eDRF)', value: '60,000' },
    { parameters: 'eDRF for broker privilege per block', value: '0.02083333' },
    { parameters: 'Multiplier of Gas Fee', value: '1.5' },
    { parameters: 'Buyback cycle(blocks)', value: '30,000' },
    { parameters: 'Buyback Slippage Tolerance', value: '2%' },
    { parameters: 'Min Grant DRFs', value: '1000' }
  ])

  const [tradingToken, setTradingToken] = useState([
    { parameters: 'κ - PCF Rate', value: '1,000' },
    { parameters: 'ψ - PCF Rate', value: '300,000,000' },
    { parameters: 'ρ - PCF', value: '0.12%' },
    { parameters: 'Trading Fee Ratio', value: '0.1%' },
    { parameters: 'Max  limit orders', value: '10' },
    { parameters: 'Max leverage', value: '75' }
  ])

  const webColumns = [
    {
      title: 'Parameters',
      dataIndex: 'parameters',
      width: '60%'
    },
    {
      title: 'Value',
      dataIndex: 'value'
    }
  ]

  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    return ''
  }, [isLoading])

  return (
    <div className="web-table-page">
      <div className="web-system-title">System Parameters-BUSD</div>
      <header className="web-table-page-header">
        <h3>System Relevant</h3>
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
        <h3>Trading Token</h3>
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
