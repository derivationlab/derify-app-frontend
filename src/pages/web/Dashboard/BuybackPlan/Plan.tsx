import React, { FC, useMemo, useState, useContext } from 'react'
import { isEmpty } from 'lodash'
import classNames from 'classnames'
import Table from 'rc-table'
import { MobileContext } from '@/providers/Mobile'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { Input } from '@/components/common/Form'
import Pagination from '@/components/common/Pagination'

import { TableMargin, TableCountDown } from '../c/TableCol'
import { PlanData as data } from './mockData'

const Plan: FC = () => {
  const { mobile } = useContext(MobileContext)
  const [keyword, setKeyword] = useState('')
  const [pageIndex, setPageIndex] = useState<number>(0)
  const isLoading = false
  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    if (isEmpty(data)) return 'No Record'
    return ''
  }, [isLoading])
  const mColumns = [
    {
      title: 'Margin',
      dataIndex: 'name',
      render: (_: string, data: Record<string, any>) => <TableMargin icon={data.icon} name={data.name} />
    },
    {
      title: 'Pool/DRF Price',
      dataIndex: 'BuybackCycle',
      align: 'right',
      render: (value: number) => (
        <>
          <BalanceShow value={value} />
          <BalanceShow value={value} />
        </>
      )
    },
    {
      title: 'Blocks/Time',
      dataIndex: 'RemainingBlock',
      align: 'right',
      render: (value: number, data: Record<string, any>) => (
        <>
          <BalanceShow value={value} rule="0,0" />
          <TableCountDown date={data.EstimatedTime} />
        </>
      )
    }
  ]
  const webColumns = [
    mColumns[0],
    {
      title: 'Buyback Cycle',
      dataIndex: 'BuybackCycle',
      width: 220,
      render: (value: number) => <BalanceShow value={value} rule="0,0" unit="Block" />
    },
    {
      title: 'Buyback Pool',
      dataIndex: 'buybackPool',
      width: 220,
      render: (value: number, data: Record<string, any>) => <BalanceShow value={value} unit={data.name} />
    },
    {
      title: 'DRF Price(Last Cycle)',
      dataIndex: 'DRFPrice',
      width: 240,
      render: (value: number) => <BalanceShow value={value} unit="BUSD" />
    },
    {
      title: 'Remaining block',
      dataIndex: 'RemainingBlock',
      width: 220,
      render: (value: number) => <BalanceShow value={value} rule="0,0" unit="Block" />
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
      <Table
        className={classNames('web-broker-table', { 'web-space-table': mobile })}
        emptyText={memoEmptyText}
        // @ts-ignore
        columns={mobile ? mColumns : webColumns}
        data={data}
        rowKey="id"
      />
      <Pagination page={pageIndex} total={100} onChange={onPageChangeEv} />
    </div>
  )
}

export default Plan
// <BalanceShow value={12345.4567} unit="USD" />
