import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext } from 'react'

import { PositionSide } from '@/store/contract/helper'
import { useSpotPrice1 } from '@/hooks/useMatchConf'
import { MobileContext } from '@/context/Mobile'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useMarginToken } from '@/zustand'
import { BASE_TOKEN_SYMBOL, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { bnDiv, bnMinus, bnMul, isGT, isLTET, nonBigNumberInterception } from '@/utils/tools'

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
  const marginToken = useMarginToken((state) => state.marginToken)
  const variablesLoaded = useTraderInfo((state) => state.variablesLoaded)

  const { spotPrice } = useSpotPrice1(marginToken)

  const memoMargin = useMemo(() => {
    return bnDiv(bnMul(data.size, spotPrice[data.quoteToken]), data.leverage)
  }, [data, spotPrice])

  const memoVolume = useMemo(() => {
    return bnMul(data.size, spotPrice[data.quoteToken])
  }, [data, spotPrice])

  const memoUnrealizedPnl = useMemo(() => {
    if (isGT(spotPrice[data.quoteToken], 0)) {
      const p1 = bnMinus(spotPrice[data.quoteToken], data.averagePrice)
      const p2 = bnMul(p1, data.size)
      const p3 = data.side === PositionSide.long ? 1 : -1
      return bnMul(p2, p3)
    }
    return '0'
  }, [spotPrice, data])

  const memoReturnRate = useMemo(() => {
    return bnDiv(memoUnrealizedPnl, memoMargin)
  }, [memoUnrealizedPnl, memoMargin])

  const judgeUpsAndDowns = (data: string): string => (isGT(data, 0) ? '+' : '')

  const atom1Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyPosition.UnrealizedPnL', 'Unrealized PnL')}
        tip={t('Trade.MyPosition.UnrealizedPnLTip')}
        footer={BASE_TOKEN_SYMBOL}
      >
        <span className={classNames(`${judgeUpsAndDowns(memoUnrealizedPnl) ? 'up' : 'down'}`)}>
          {judgeUpsAndDowns(memoUnrealizedPnl)}
          {nonBigNumberInterception(bnMul(memoUnrealizedPnl, 100))} ( {judgeUpsAndDowns(memoReturnRate)}
          {nonBigNumberInterception(bnMul(memoReturnRate, 100))}% )
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
        footer={(data?.name ?? '').replace('-', ' / ')}
      >
        <span>
          {nonBigNumberInterception(data?.size ?? 0, 4)} / {nonBigNumberInterception(memoVolume)}
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
        <span>{nonBigNumberInterception(data?.averagePrice ?? 0)}</span>
      </DataAtom>
    ),
    [data?.averagePrice, t]
  )
  const atom4Tsx = useMemo(() => {
    let lp
    if (variablesLoaded) {
      const { marginBalance = 0, totalPositionAmount = 0 } = variables
      const mul = data.side === PositionSide.short ? -1 : 1

      const p1 = bnMul(totalPositionAmount, 0.01)
      const p2 = bnMinus(marginBalance, p1)
      const p3 = bnDiv(p2, data.size)
      const p4 = bnMul(p3, mul)
      const p5 = bnMinus(spotPrice[data.quoteToken], p4)
      lp = isLTET(p5, 0) ? '--' : nonBigNumberInterception(p5)
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
  }, [data, spotPrice, variables, variablesLoaded, t])

  const atom5Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.MyPosition.Margin', 'Margin')}
        tip={t('Trade.MyPosition.MarginTip')}
        footer={BASE_TOKEN_SYMBOL}
      >
        <span>{nonBigNumberInterception(memoMargin)}</span>
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
          {base.toFixed(2)}%
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
          symbol={`${data.quoteToken}${marginToken}`}
          multiple={data?.leverage}
          direction={PositionSide[data?.side] as any}
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
