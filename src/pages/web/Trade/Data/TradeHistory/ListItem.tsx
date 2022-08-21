import React, { FC, useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'

import { getPairName, PositionSide, getPairBaseCoinName } from '@/store/contract/helper'
import { safeInterceptionValues } from '@/utils/tools'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { MobileContext } from '@/context/Mobile'

import ItemHeader from '../c/ItemHeader'
import AtomWrap from '../c/AtomWrap'
import DataAtom from '../c/DataAtom'

interface Props {
  data?: Record<string, any>
}

const TradeHistoryListItem: FC<Props> = ({ data }) => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const memoTimestamp = useMemo(() => {
    return dayjs(data?.event_time ?? 0)
  }, [data?.event_time])

  const memoTradingFee = useMemo(() => {
    if (data?.trading_fee) {
      return (safeInterceptionValues(data?.trading_fee) as any) * -1
    }
    return '--'
  }, [data?.trading_fee])

  const memoChangeFee = useMemo(() => {
    if (data?.position_change_fee) {
      return (safeInterceptionValues(data?.position_change_fee) as any) * -1
    }
    return '--'
  }, [data?.position_change_fee])

  const memoTypeSide = useMemo(() => {
    return data?.type < 3 ? t('Trade.TradeHistory.Open', 'Open') : t('Trade.TradeHistory.Close', 'Close')
  }, [data?.type, t])

  // todo make map better
  // * 0-MarketPriceOpen
  // * 1-HedgeMarketPriceOpen
  // * 2-LimitPriceOpen
  // * 3-StopProfitClose
  // * 4-StopLossClose
  // * 5-AutoDeleveragingClose
  // * 6-MandatoryLiquidationClose
  // * 7-SingleClose
  // * 8-AllCloseHedgePart
  // * 9-AllCloseLeftPart
  const tradeDesc = [
    { desc: t('Trade.TradeHistory.MarketPrice', 'Market Price') }, //MarketPriceOpen
    { desc: t('Trade.TradeHistory.MarketPrice', 'Market Price') }, //HedgeMarketPriceOpen
    { desc: t('Trade.TradeHistory.LimitPrice', 'Limit Price') }, //LimitPriceOpen
    { desc: t('Trade.TradeHistory.TakeProfit', 'Take Profit') }, //StopProfitClose
    { desc: t('Trade.TradeHistory.StopLoss', 'Stop Loss') }, //StopLossClose
    { desc: t('Trade.TradeHistory.Deleverage', 'Deleverage') }, //AutoDeleveragingClose
    { desc: t('Trade.TradeHistory.Liquidate', 'Liquidate') }, //MandatoryLiquidationClose
    { desc: t('Trade.TradeHistory.MarketPrice', 'Market Price') }, //SingleClose
    { desc: t('Trade.TradeHistory.MarketPrice', 'Market Price') }, //AllCloseHedgePart
    { desc: t('Trade.TradeHistory.MarketPrice', 'Market Price') } //AllCloseLeftPart
  ]

  const atom1Tsx = useMemo(
    () => (
      <DataAtom label={t('Trade.TradeHistory.Type', 'Type')} footer={tradeDesc[data?.type].desc}>
        <span className={classNames(`${data?.type < 3 ? 'up' : 'down'}`)}>{memoTypeSide}</span>
      </DataAtom>
    ),
    [data?.type, memoTypeSide, t]
  )

  const atom2Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.TradeHistory.RealizedPnL', 'Realized PnL')}
        tip={t('Trade.TradeHistory.RealizedPnLTip')}
        footer={BASE_TOKEN_SYMBOL}
      >
        <span className={classNames({ up: data?.pnl_usdt > 0, down: data?.pnl_usdt < 0 })}>
          {data?.pnl_usdt ? safeInterceptionValues(data?.pnl_usdt) : '--'}
        </span>
      </DataAtom>
    ),
    [data?.pnl_usdt, t]
  )
  const atom3Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.TradeHistory.TradingFee', 'Trading Fee')}
        tip={t('Trade.TradeHistory.TradingFeeTip')}
        footer={BASE_TOKEN_SYMBOL}
      >
        <span className={classNames({ up: memoTradingFee > 0, down: memoTradingFee < 0 })}>{memoTradingFee}</span>
      </DataAtom>
    ),
    [memoTradingFee, t]
  )
  const atom4Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.TradeHistory.PositionChangeFee', 'Position Change Fee')}
        tip={t('Trade.TradeHistory.PositionChangeFeeTip')}
        footer={BASE_TOKEN_SYMBOL}
      >
        <span className={classNames({ up: memoChangeFee > 0, down: memoChangeFee < 0 })}>{memoChangeFee}</span>
      </DataAtom>
    ),
    [memoChangeFee, t]
  )
  const atom5Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.TradeHistory.VolumeBase', 'Volume (Base)')}
        tip={t('Trade.TradeHistory.VolumeBaseTip')}
        footer={getPairBaseCoinName(data?.token)}
      >
        {safeInterceptionValues(data?.size, 4)}
      </DataAtom>
    ),
    [data?.size, data?.token, t]
  )
  const atom6Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.TradeHistory.VolumeQuoted', 'Volume (Quoted)')}
        tip={t('Trade.TradeHistory.VolumeQuotedTip')}
        footer={BASE_TOKEN_SYMBOL}
      >
        {safeInterceptionValues(data?.amount)}
      </DataAtom>
    ),
    [data?.amount, t]
  )
  const atom7Tsx = useMemo(
    () => (
      <DataAtom label={t('Trade.TradeHistory.Price', 'Price')} footer={BASE_TOKEN_SYMBOL}>
        {safeInterceptionValues(data?.price)}
      </DataAtom>
    ),
    [data?.price, t]
  )
  const atom8Tsx = useMemo(
    () => (
      <DataAtom label={t('Trade.TradeHistory.Time', 'Time')} footer={data?.event_time ? memoTimestamp.fromNow() : '-'}>
        {data?.event_time ? memoTimestamp.format('YYYY-MM-DD HH:mm:ss') : '-'}
      </DataAtom>
    ),
    [data?.event_time, memoTimestamp, t]
  )

  return (
    <div className="web-trade-data-item">
      <ItemHeader symbol={getPairName(data?.token)} direction={PositionSide[data?.side] as any} />
      {mobile ? (
        <>
          <AtomWrap>
            {atom1Tsx}
            {atom2Tsx}
          </AtomWrap>
          <hr />
          <AtomWrap>
            {atom3Tsx}
            {atom4Tsx}
          </AtomWrap>
          <hr />
          <AtomWrap>
            {atom5Tsx}
            {atom6Tsx}
          </AtomWrap>
          <hr />
          <AtomWrap>
            {atom7Tsx}
            {atom8Tsx}
          </AtomWrap>
        </>
      ) : (
        <>
          <AtomWrap>
            {atom1Tsx}
            {atom2Tsx}
            {atom3Tsx}
            {atom4Tsx}
          </AtomWrap>
          <hr />
          <AtomWrap>
            {atom5Tsx}
            {atom6Tsx}
            {atom7Tsx}
            {atom8Tsx}
          </AtomWrap>
        </>
      )}
    </div>
  )
}

export default TradeHistoryListItem
