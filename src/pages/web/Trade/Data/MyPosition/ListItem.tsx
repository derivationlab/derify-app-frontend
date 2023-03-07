import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext } from 'react'

import { useSpotPrice } from '@/hooks/useMatchConf'
import { MobileContext } from '@/context/Mobile'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useQuoteToken } from '@/zustand'
import { PositionSideTypes } from '@/typings'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { findToken, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { bnDiv, bnMinus, bnMul, isGT, isLTET, keepDecimals } from '@/utils/tools'

import ItemHeader from '../c/ItemHeader'
import AtomWrap from '../c/AtomWrap'
import DataAtom from '../c/DataAtom'
import Reminder from '../c/Reminder'
import EditButton from '../c/EditButton'

interface Props {
  data: Record<string, any>
  onEdit: (data: Record<string, any>) => void
  onClick: (data: Record<string, any>) => void
}

const MyPositionListItem: FC<Props> = ({ data, onEdit, onClick }) => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const variables = useTraderInfo((state) => state.variables)
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const variablesLoaded = useTraderInfo((state) => state.variablesLoaded)

  const marginToken = useMTokenFromRoute()

  const { spotPrices } = useSpotPrice(quoteToken, marginToken)

  const memoMargin = useMemo(() => {
    return bnDiv(bnMul(data.size, spotPrices[data.quoteToken]), data.leverage)
  }, [data, spotPrices])

  const memoVolume = useMemo(() => {
    return bnMul(data.size, spotPrices[data.quoteToken])
  }, [data, spotPrices])

  const memoUnrealizedPnl = useMemo(() => {
    if (isGT(spotPrices[data.quoteToken], 0)) {
      const p1 = bnMinus(spotPrices[data.quoteToken], data.averagePrice)
      const p2 = bnMul(p1, data.size)
      const p3 = data.side === PositionSideTypes.long ? 1 : -1
      return bnMul(p2, p3)
    }
    return '0'
  }, [spotPrices, data])

  const memoReturnRate = useMemo(() => {
    return isGT(memoMargin, 0) ? bnDiv(memoUnrealizedPnl, memoMargin) : '0'
  }, [memoUnrealizedPnl, memoMargin])

  const judgeUpsAndDowns = (data: string): string => (isGT(data, 0) ? '+' : '')

  const atom1Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyPosition.UnrealizedPnL', 'Unrealized PnL')}
        tip={t('Trade.MyPosition.UnrealizedPnLTip')}
        footer={marginToken}
      >
        <span className={classNames(`${judgeUpsAndDowns(memoUnrealizedPnl) ? 'up' : 'down'}`)}>
          {judgeUpsAndDowns(memoUnrealizedPnl)}
          {keepDecimals(memoUnrealizedPnl, findToken(marginToken).decimals)} ( {judgeUpsAndDowns(memoReturnRate)}
          {keepDecimals(bnMul(memoReturnRate, 100), 2)}% )
        </span>
      </DataAtom>
    ),
    [memoReturnRate, memoUnrealizedPnl, t]
  )

  const atom2Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyPosition.Volume', 'Volume')}
        tip={t('Trade.MyPosition.VolumeTip')}
        footer={`${data.quoteToken} / ${marginToken}`}
      >
        <span>
          {keepDecimals(data?.size ?? 0, 4)} / {keepDecimals(memoVolume, findToken(marginToken).decimals)}
        </span>
      </DataAtom>
    ),
    [data, t, memoVolume]
  )
  const atom3Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyPosition.AvgPrice', 'Avg. Price')}
        tip={t('Trade.MyPosition.AvgPriceTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        <span>{keepDecimals(data?.averagePrice ?? 0, 2)}</span>
      </DataAtom>
    ),
    [data?.averagePrice, t]
  )
  const atom4Tsx = useMemo(() => {
    let lp
    if (variablesLoaded) {
      const { marginBalance = 0, totalPositionAmount = 0 } = variables
      const mul = data.side === PositionSideTypes.short ? -1 : 1

      const p1 = bnMul(totalPositionAmount, 0.01)
      const p2 = bnMinus(marginBalance, p1)
      const p3 = bnDiv(p2, data.size)
      const p4 = bnMul(p3, mul)
      const p5 = bnMinus(spotPrices[data.quoteToken], p4)
      lp = isLTET(p5, 0) ? '--' : keepDecimals(p5, 2)
    } else {
      lp = '--'
    }

    return (
      <DataAtom
        label={t('Trade.MyPosition.LiqPrice', 'Liq. Price')}
        tip={t('Trade.MyPosition.LiqPriceTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        <span>{lp}</span>
      </DataAtom>
    )
  }, [data, spotPrices, variables, variablesLoaded, t])

  const atom5Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.MyPosition.Margin', 'Margin')}
        tip={t('Trade.MyPosition.MarginTip')}
        footer={marginToken}
      >
        <span>{keepDecimals(memoMargin, findToken(marginToken).decimals)}</span>
      </DataAtom>
    )
  }, [memoMargin, t])

  const atom6Tsx = useMemo(() => {
    let alertLevel = 0
    const base = Number(variables.marginRate) * 100

    if (base > 20) alertLevel = 0
    else if (base > 5) alertLevel = 1
    else if (base > 2) alertLevel = 2
    else if (base > 1.33) alertLevel = 3
    else if (base > 1.11) alertLevel = 4
    else alertLevel = 5

    return (
      <DataAtom hover label={t('Trade.MyPosition.MarginRate', 'Margin Rate')} tip={t('Trade.MyPosition.MarginRateTip')}>
        <span className={classNames('reminder', `${base >= 0 ? 'up' : 'down'}`)}>
          {judgeUpsAndDowns(base as any)}
          {keepDecimals(base, 2)}%
        </span>
        <Reminder alertLevel={alertLevel} />
      </DataAtom>
    )
  }, [variables.marginRate, t])

  const atom7Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyPosition.TakeProfit', 'Take Profit')}
        tip={t('Trade.MyPosition.TakeProfitTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        {data?.takeProfitPrice} <EditButton onClick={() => onEdit(data)} />
      </DataAtom>
    ),
    [data, onEdit, t]
  )
  const atom8Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyPosition.StopLoss', 'Stop Loss')}
        tip={t('Trade.MyPosition.StopLossTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        {data?.stopLossPrice} <EditButton onClick={() => onEdit(data)} />
      </DataAtom>
    ),
    [data, onEdit, t]
  )

  return (
    <>
      <div className="web-trade-data-item">
        <ItemHeader
          symbol={`${data.quoteToken}${VALUATION_TOKEN_SYMBOL}`}
          multiple={data?.leverage}
          direction={PositionSideTypes[data?.side] as any}
          buttonText={t('Trade.MyPosition.Close', 'Close')}
          onButtonClick={() => onClick(data)}
        />
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
    </>
  )
}

export default MyPositionListItem
