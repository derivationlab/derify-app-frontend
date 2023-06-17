import { getAddress } from '@ethersproject/address'
import classNames from 'classnames'
import dayjs from 'dayjs'

import React, { FC, useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { MobileContext } from '@/providers/Mobile'
import { marginToken, useDerivativeListStore, useMarginTokenListStore } from '@/store'
import { PositionSideTypes } from '@/typings'
import { keepDecimals, nonBigNumberInterception, numeralNumber } from '@/utils/tools'

import AtomWrap from '../c/AtomWrap'
import DataAtom from '../c/DataAtom'
import ItemHeader from '../c/ItemHeader'

interface Props {
  data: Record<string, any>
}

const TradeHistoryListItem: FC<Props> = ({ data }) => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)

  const decimals = useMemo(() => {
    const find = derivativeList.find((d) => getAddress(d.token) === getAddress(data.token))
    return find?.price_decimals ?? 2
  }, [derivativeList])

  const memoQuoteToken = useMemo(() => {
    if (derivativeList.length)
      return derivativeList.find((d) => getAddress(d.token) === getAddress(data.token))?.name ?? ''
    return ''
  }, [data?.token])

  const memoMarginToken = useMemo(() => {
    if (marginTokenList.length) return marginTokenList.find((d) => d.margin_token === data?.margin_token)?.symbol ?? ''
    return ''
  }, [data?.margin_token])

  const memoTimestamp = useMemo(() => {
    return dayjs(data?.event_time ?? 0)
  }, [data?.event_time])

  const memoTradingFee = useMemo(() => {
    if (data?.trading_fee) {
      return (nonBigNumberInterception(data?.trading_fee) as any) * -1
    }
    return '--'
  }, [data?.trading_fee])

  const memoChangeFee = useMemo(() => {
    if (data?.position_change_fee) {
      return (nonBigNumberInterception(data?.position_change_fee) as any) * -1
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
        footer={memoMarginToken}
      >
        <span className={classNames({ up: data?.pnl_margin_token > 0, down: data?.pnl_margin_token < 0 })}>
          {data?.pnl_margin_token ? nonBigNumberInterception(data?.pnl_margin_token) : '--'}
        </span>
      </DataAtom>
    ),
    [memoMarginToken, data?.pnl_margin_token, t]
  )
  const atom3Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.TradeHistory.TradingFee', 'Trading Fee')}
        tip={t('Trade.TradeHistory.TradingFeeTip')}
        footer={memoMarginToken}
      >
        <span className={classNames({ up: memoTradingFee > 0, down: memoTradingFee < 0 })}>{memoTradingFee}</span>
      </DataAtom>
    ),
    [memoMarginToken, memoTradingFee, t]
  )
  const atom4Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.TradeHistory.PositionChangeFee', 'Position Change Fee')}
        tip={t('Trade.TradeHistory.PositionChangeFeeTip')}
        footer={memoMarginToken}
      >
        <span className={classNames({ up: memoChangeFee > 0, down: memoChangeFee < 0 })}>
          {keepDecimals(memoChangeFee, 2)}
        </span>
      </DataAtom>
    ),
    [memoChangeFee, memoMarginToken, t]
  )
  const atom5Tsx = useMemo(() => {
    const size = data?.size ?? 0
    const output = Number(size) < 1 ? nonBigNumberInterception(size, 8) : numeralNumber(size, 2)
    return (
      <DataAtom
        label={t('Trade.TradeHistory.VolumeBase', 'Volume (Base)')}
        tip={t('Trade.TradeHistory.VolumeBaseTip')}
        footer={memoQuoteToken.split('/')[0]}
      >
        {output}
      </DataAtom>
    )
  }, [data?.size, data?.token, t])
  const atom6Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.TradeHistory.VolumeQuoted', 'Volume (Quoted)')}
        tip={t('Trade.TradeHistory.VolumeQuotedTip')}
        footer={memoMarginToken}
      >
        {numeralNumber(data?.amount, marginToken.decimals)}
      </DataAtom>
    )
  }, [data?.amount, marginToken, memoMarginToken, t])
  const atom7Tsx = useMemo(
    () => (
      <DataAtom label={t('Trade.TradeHistory.Price', 'Price')} footer={VALUATION_TOKEN_SYMBOL}>
        {keepDecimals(data?.price, decimals)}
      </DataAtom>
    ),
    [decimals, data?.price, t]
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
      <ItemHeader symbol={memoQuoteToken} direction={PositionSideTypes[data?.side] as any} />
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
