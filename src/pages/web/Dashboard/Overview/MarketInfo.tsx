import classNames from 'classnames'
import { isEmpty } from 'lodash'
import Table from 'rc-table'

import React, { FC, useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Button from '@/components/common/Button'
import DecimalShow from '@/components/common/DecimalShow'
import Spinner from '@/components/common/Spinner'
// import Pagination from '@/components/common/Pagination'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { useAllCurrentTrading } from '@/hooks/useAllCurrentTrading'
import { useAllMarginPositions } from '@/hooks/useAllMarginPositions'
import { useBoundPools } from '@/hooks/useBoundPools'
import { useAllMarginIndicators } from '@/hooks/useMarginIndicators'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenListStore } from '@/store'
import { bnMul, keepDecimals } from '@/utils/tools'

import { TableMargin } from '../c/TableCol'

const MarketInfo: FC = () => {
  const history = useHistory()

  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const marginAddressList = useMarginTokenListStore((state) => state.marginAddressList)
  const marginTokenListLoaded = useMarginTokenListStore((state) => state.marginTokenListLoaded)

  const { data: boundPools } = useBoundPools(marginAddressList)
  const { data: tradingVol } = useAllCurrentTrading(marginAddressList)
  const { data: indicators } = useAllMarginIndicators(marginAddressList)
  const { data: allPositions } = useAllMarginPositions()

  const mColumns = useMemo(() => {
    return [
      {
        title: t('NewDashboard.Overview.Margin'),
        dataIndex: 'name',
        render: (_: string, data: Record<string, any>) => <TableMargin icon={data.logo} name={data.symbol} />
      },
      {
        title: 'Trading/Position',
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => (
          <>
            <BalanceShow value={boundPools?.[data.margin_token] ?? 0} unit={symbol} />
            <BalanceShow value={allPositions?.[data.margin_token] ?? 0} unit={symbol} />
          </>
        )
      },
      {
        title: 'Max APR',
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          if (indicators?.[data.margin_token]) {
            const apy = Math.max.apply(null, Object.values(indicators[data.margin_token]))
            const per = keepDecimals(bnMul(apy, 100), 2)
            return <DecimalShow value={per} percent black />
          }
          return <DecimalShow value={0} percent black />
        }
      }
    ]
  }, [t, indicators, boundPools, allPositions])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('NewDashboard.Overview.MaxPositionMiningAPY'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          if (indicators?.[data.margin_token]) {
            const apy = Math.max.apply(null, Object.values(indicators[data.margin_token]))
            return <BalanceShow value={apy} percent />
          }
          return <BalanceShow value={0} percent />
        }
      },
      {
        title: t('NewDashboard.Overview.TradingVolume'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          return <BalanceShow value={tradingVol?.[data.margin_token] ?? 0} unit={symbol} />
        }
      },
      {
        title: t('NewDashboard.Overview.PositionVolume'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => (
          <BalanceShow value={allPositions?.[data.margin_token] ?? 0} unit={symbol} />
        )
      },
      {
        title: t('NewDashboard.Overview.BuybackPool'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => (
          <BalanceShow value={boundPools?.[data.margin_token] ?? 0} unit={symbol} />
        )
      },
      {
        title: t('NewDashboard.Overview.DetailInfo'),
        dataIndex: 'Margin',
        align: 'right',
        render: (_: string, data: Record<string, any>) => (
          <Button size="medium" onClick={() => history.push(`/${data.symbol}/trade`)}>
            GO
          </Button>
        )
      }
    ]
  }, [t, tradingVol, indicators, boundPools, allPositions])

  const emptyText = useMemo(() => {
    if (!marginTokenListLoaded) return <Spinner small />
    if (isEmpty(marginTokenList)) return t('NewDashboard.Overview.NoResultsFound')
    return ''
  }, [t, marginTokenListLoaded])

  return (
    <div className="web-dashboard-overview-market">
      <header className="web-dashboard-section-header">
        <h3>{t('NewDashboard.Overview.MarketInfo')}</h3>
        <div className="web-dashboard-section-header-search">
          {/*todo search*/}
          {/*<Input value={keyword} onChange={setKeyword} placeholder={t('NewDashboard.Overview.SerchTip')}>*/}
          {/*  <button className='web-dashboard-section-header-search-button' onClick={onSearch} />*/}
          {/*</Input>*/}
        </div>
      </header>
      <Table
        rowKey="symbol"
        data={marginTokenList}
        // @ts-ignore
        columns={mobile ? mColumns : wColumns}
        className={classNames('web-broker-table', { 'web-space-table': mobile })}
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'open' : 'close')}
      />
      {/*<Pagination page={state.pageIndex} total={state.records.totalItems} onChange={pageChange} />*/}
    </div>
  )
}

export default MarketInfo
