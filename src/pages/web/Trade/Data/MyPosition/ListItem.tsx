import React, { FC, useMemo, useContext } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { PositionSide } from '@/store/contract/helper'
import { useSpotPrice } from '@/hooks/useMatchConf'
import { MobileContext } from '@/context/Mobile'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { isLTET, nonBigNumberInterception, safeInterceptionValues } from '@/utils/tools'

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

  const { spotPrice, quoteToken, marginToken } = useSpotPrice()

  const variables = useTraderInfo((state) => state.variables)
  const variablesLoaded = useTraderInfo((state) => state.variablesLoaded)

  const memoMargin = useMemo(() => {
    return (data?.size * spotPrice) / data.leverage
  }, [data, spotPrice])

  const memoVolume = useMemo(() => {
    return Number(spotPrice) * Number(data.size)
  }, [data, spotPrice])

  const memoUnrealizedPnl = useMemo(() => {
    if (Number(spotPrice) > 0)
      return (spotPrice - data.averagePrice) * data.size * (data.side === PositionSide.long ? 1 : -1)
    return 0
  }, [spotPrice, data])

  const memoReturnRate = useMemo(() => {
    return memoUnrealizedPnl / memoMargin
  }, [memoUnrealizedPnl, memoMargin])

  const judgeUpsAndDowns = (data: number): string => (data > 0 ? '+' : '')

  const atom1Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyPosition.UnrealizedPnL', 'Unrealized PnL')}
        tip={t('Trade.MyPosition.UnrealizedPnLTip')}
        footer={BASE_TOKEN_SYMBOL}
      >
        <span className={classNames(`${judgeUpsAndDowns(memoUnrealizedPnl) ? 'up' : 'down'}`)}>
          {judgeUpsAndDowns(memoUnrealizedPnl)}
          {nonBigNumberInterception(memoUnrealizedPnl * 100)} ( {judgeUpsAndDowns(memoReturnRate)}
          {nonBigNumberInterception(memoReturnRate * 100)}% )
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
        footer={BASE_TOKEN_SYMBOL}
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
      const sub =
        spotPrice - ((Number(marginBalance) - Number(totalPositionAmount) * 0.01) / data.size) * mul
      lp = isLTET(sub, 0) ? '--' : safeInterceptionValues(String(sub))
    } else {
      lp = '--'
    }

    return (
      <DataAtom
        label={t('Trade.MyPosition.LiqPrice', 'Liq. Price')}
        tip={t('Trade.MyPosition.LiqPriceTip')}
        footer={BASE_TOKEN_SYMBOL}
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
          {judgeUpsAndDowns(base)}
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
        footer={BASE_TOKEN_SYMBOL}
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
        footer={BASE_TOKEN_SYMBOL}
      >
        {data?.stopLossPrice} <EditButton onClick={() => onEdit(data)} />
      </DataAtom>
    ),
    [data, onEdit, t]
  )

  return (
    <>
      <div className='web-trade-data-item'>
        <ItemHeader
          symbol={`${quoteToken}-${marginToken}`}
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
