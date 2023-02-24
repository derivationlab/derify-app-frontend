import React, { FC, useMemo, useState } from 'react'
import { isEmpty } from 'lodash'
import Table from 'rc-table'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { Input } from '@/components/common/Form'
import Pagination from '@/components/common/Pagination'

import { TableMargin, TableCountDown } from '../c/TableCol'
import { PlanData as data } from './mockData'

const Plan: FC = () => {
  const [keyword, setKeyword] = useState('')
  const [pageIndex, setPageIndex] = useState<number>(0)
  const isLoading = false
  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    if (isEmpty(data)) return 'No Record'
    return ''
  }, [isLoading])
  const webColumns = [
    {
      title: 'Margin',
      dataIndex: 'name',
      render: (_: string, data: Record<string, any>) => <TableMargin icon={data.icon} name={data.name} />
    },
    {
      title: 'Buyback Cycle',
      dataIndex: 'BuybackCycle',
      width: 220,
      render: (value: number) => <BalanceShow value={value} format="0.00a" unit="Block" />
    },
    {
      title: 'Buyback Pool',
      dataIndex: 'buybackPool',
      width: 220,
      render: (value: number, data: Record<string, any>) => (
        <BalanceShow value={value} format="0.00a" unit={data.name} />
      )
    },
    {
      title: 'DRF Price(Last Cycle)',
      dataIndex: 'DRFPrice',
      width: 240,
      render: (value: number) => <BalanceShow value={value} format="0.00" unit="BUSD" />
    },
    {
      title: 'Remaining block',
      dataIndex: 'RemainingBlock',
      width: 220,
      render: (value: number) => <BalanceShow value={value} format="0,0" unit="Block" />
    },
    {
      title: 'Estimated Time',
      dataIndex: 'EstimatedTime',
      width: 240,
      render: (value: number) => <TableCountDown date={value} />
    }
  ]

  const onSearch = () => {
    if (keyword) {
      console.log('Search keyword: ' + keyword)
    }
  }

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    // void getBrokersListCb(index)
  }

  return (
    <div className="web-dashboard-plan-list">
      <header className="web-dashboard-section-header">
        <h3>Buyback Plan</h3>
        <div className="web-dashboard-section-header-search">
          <Input value={keyword} onChange={setKeyword} placeholder="serch name or contract address..">
            <button className="web-dashboard-section-header-search-button" onClick={onSearch} />
          </Input>
        </div>
      </header>
      {/* @ts-ignore */}
      <Table className="web-broker-table" emptyText={memoEmptyText} columns={webColumns} data={data} rowKey="id" />
      <Pagination page={pageIndex} total={100} onChange={onPageChangeEv} />
    </div>
  )
}

export default Plan
// <BalanceShow value={12345.4567} unit="USD" />
