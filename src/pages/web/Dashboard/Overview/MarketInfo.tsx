import classNames from 'classnames'
import { isEmpty, orderBy } from 'lodash'
import Table from 'rc-table'

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Button from '@/components/common/Button'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useInitData } from '@/pages/web/Dashboard/Overview/hooks'
import { getMarginTokenList } from '@/store'
import { Rec } from '@/typings'
import { bnMul, bnPlus } from '@/utils/tools'

import { TableMargin } from '../c/TableCol'

interface IPagination {
  data: any[]
  index: number
}

export const resortMargin = (data: any[]) => {
  return orderBy(data, ['open', 'max_pm_apy'], ['desc', 'desc'])
}

const MarketInfo: FC = () => {
  const history = useHistory()
  const { t } = useTranslation()
  const [pagination, setPagination] = useState<IPagination>({ data: [], index: 0 })
  const {
    prices,
    spotPrices,
    indicators,
    boundPools,
    tradingVol,
    equityValues,
    allPositions,
    pagingParams,
    marginTokenList,
    marginTokenListLoaded
  } = useInitData()

  const calcVolumeHelper = useCallback(
    (marginToken: string) => {
      let volume = '0'
      if (allPositions && marginToken in allPositions && spotPrices) {
        const base = allPositions[marginToken]
        volume = Object.keys(base).reduce((p, n: string) => {
          const price = spotPrices.find((f) => f.token === n)?.price ?? 0
          return bnPlus(bnMul(base[n], price), p)
        }, '0')
      }
      return volume
    },
    [spotPrices, allPositions]
  )

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
        render: (symbol: string, data: Rec) => {
          const volume1 = tradingVol?.[data.margin_token] ?? 0
          const volume2 = calcVolumeHelper(data.margin_token)
          const _prices = prices ?? Object.create(null)
          const findKey = Object.keys(_prices).find((l) => l === data.margin_token) ?? ''
          const findEquity = equityValues.find((l) => l.margin_token === data.margin_token)
          const equityValue1 = findEquity?.trading_net_value ?? 0
          const equityValue2 = bnMul(_prices[findKey] ?? 0, volume2)
          return (
            <>
              <>
                <BalanceShow value={volume1} unit={symbol} decimal={Number(volume1) === 0 ? 2 : data.amount_decimals} />
                <BalanceShow classNames="s" value={equityValue1} unit={VALUATION_TOKEN_SYMBOL} decimal={2} />
              </>
              <>
                <BalanceShow value={volume2} unit={symbol} decimal={Number(volume2) === 0 ? 2 : data.amount_decimals} />
                <BalanceShow
                  classNames="s"
                  value={equityValue2}
                  unit={VALUATION_TOKEN_SYMBOL}
                  decimal={Number(equityValue2) === 0 ? 2 : data.amount_decimals}
                />
              </>
            </>
          )
        }
      },
      {
        title: 'Max APR',
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          if (indicators?.[data.margin_token]) {
            const apy = Math.max.apply(null, Object.values(indicators[data.margin_token]))
            return <BalanceShow value={apy} decimal={2} percent />
          }
          return <BalanceShow value={0} decimal={2} percent />
        }
      }
    ]
  }, [t, prices, calcVolumeHelper, indicators, equityValues])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('NewDashboard.Overview.MaxPositionMiningAPY'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Rec) => {
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
        render: (symbol: string, data: Rec) => {
          const volume = tradingVol?.[data.margin_token] ?? 0
          const _prices = prices ?? Object.create(null)
          const findKey = Object.keys(_prices).find((l) => l === data.margin_token) ?? ''
          const findEquity = equityValues.find((l) => l.margin_token === data.margin_token)
          const equityValue = findEquity?.trading_net_value ?? 0
          return (
            <>
              <BalanceShow value={volume} unit={symbol} decimal={Number(volume) === 0 ? 2 : data.amount_decimals} />
              <BalanceShow classNames="s" value={equityValue} unit={VALUATION_TOKEN_SYMBOL} decimal={2} />
            </>
          )
        }
      },
      {
        title: t('NewDashboard.Overview.PositionVolume'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Rec) => {
          const volume = calcVolumeHelper(data.margin_token)
          const _prices = prices ?? Object.create(null)
          const findKey = Object.keys(_prices).find((l) => l === data.margin_token) ?? ''
          const equityValue = bnMul(_prices[findKey] ?? 0, volume)
          return (
            <>
              <BalanceShow value={volume} unit={symbol} decimal={Number(volume) === 0 ? 2 : data.amount_decimals} />
              <BalanceShow classNames="s" value={equityValue} unit={VALUATION_TOKEN_SYMBOL} decimal={2} />
            </>
          )
        }
      },
      {
        title: t('NewDashboard.Overview.DetailInfo'),
        dataIndex: 'Margin',
        align: 'right',
        render: (_: string, data: Record<string, any>) => (
          <Button size="medium" disabled={!data.open} onClick={() => history.push(`/${data.symbol}/trade`)}>
            GO
          </Button>
        )
      }
    ]
  }, [t, prices, tradingVol, indicators, boundPools, equityValues, calcVolumeHelper])

  const emptyText = useMemo(() => {
    if (!marginTokenListLoaded) return <Spinner small />
    if (isEmpty(marginTokenList)) return t('NewDashboard.Overview.NoResultsFound')
    return ''
  }, [t, marginTokenListLoaded])

  const onPagination = async (index: number) => {
    setPagination((val) => ({ ...val, index }))
    const data = await getMarginTokenList(index)
    setPagination((val) => ({ ...val, data: resortMargin(data?.records ?? []) }))
  }

  useEffect(() => {
    if (marginTokenList.length) {
      setPagination((val) => ({ ...val, data: resortMargin(marginTokenList) }))
    }
  }, [marginTokenList])

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
        data={pagination.data}
        columns={isMobile ? mColumns : wColumns}
        className={classNames('web-broker-table1', { 'web-space-table': isMobile })}
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'open' : 'close')}
      />
      {pagingParams.totalItems > 0 && (
        <Pagination page={pagination.index} total={pagingParams.totalItems} onChange={onPagination} />
      )}
    </div>
  )
}

export default MarketInfo
