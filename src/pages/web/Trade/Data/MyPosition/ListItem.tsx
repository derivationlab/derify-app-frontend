import classNames from 'classnames'

import React, { FC, useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useClearingParams } from '@/hooks/useClearingParams'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenStore, useProtocolConfigStore, useTokenSpotPricesStore, useTraderVariablesStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { PositionSideTypes } from '@/typings'
import { bnDiv, bnMinus, bnMul, isGT, isLTET, keepDecimals, numeralNumber } from '@/utils/tools'

import AtomWrap from '../c/AtomWrap'
import DataAtom from '../c/DataAtom'
import EditButton from '../c/EditButton'
import ItemHeader from '../c/ItemHeader'
import Reminder from '../c/Reminder'

interface Props {
  data: Record<string, any>
  onEdit: (data: Record<string, any>) => void
  onClick: (data: Record<string, any>) => void
}

const riseOrFall = (data: string): string => (isGT(data, 0) ? '+' : '')

const MyPositionListItem: FC<Props> = ({ data, onEdit, onClick }) => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const variables = useTraderVariablesStore((state) => state.variables)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const variablesLoaded = useTraderVariablesStore((state) => state.variablesLoaded)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)

  const { clearingParams } = useClearingParams(protocolConfig?.clearing)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[data.derivative] ?? '0'
  }, [data, tokenSpotPrices])

  const memoMargin = useMemo(() => {
    return bnDiv(bnMul(data.size, spotPrice), data.leverage)
  }, [data, spotPrice])

  const memoVolume = useMemo(() => {
    return bnMul(data.size, spotPrice)
  }, [data, spotPrice])

  const memoPnL = useMemo(() => {
    if (isGT(spotPrice, 0) && isGT(data.size, 0) && isGT(data.averagePrice, 0)) {
      const p1 = bnMinus(spotPrice, data.averagePrice)
      const p2 = bnMul(p1, data.size)
      const p3 = data.side === PositionSideTypes.long ? 1 : -1
      return bnMul(p2, p3)
    }
    return '0'
  }, [data, spotPrice])

  const memoRate = useMemo(() => {
    return isGT(memoMargin, 0) ? bnDiv(memoPnL, memoMargin) : '0'
  }, [memoPnL, memoMargin])

  const atom1Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyPosition.UnrealizedPnL', 'Unrealized PnL')}
        tip={t('Trade.MyPosition.UnrealizedPnLTip')}
        footer={marginToken.symbol}
      >
        <span className={classNames(`${riseOrFall(memoPnL) ? 'up' : 'down'}`)}>
          {riseOrFall(memoPnL)}
          {numeralNumber(memoPnL, 2)} ({riseOrFall(memoRate)}
          {numeralNumber(bnMul(memoRate, 100), 2)}%)
        </span>
      </DataAtom>
    ),
    [memoRate, memoPnL, t]
  )

  const atom2Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyPosition.Volume', 'Volume')}
        tip={t('Trade.MyPosition.VolumeTip')}
        footer={`${data.quoteToken} / ${marginToken.symbol}`}
      >
        <span>
          {numeralNumber(data?.size ?? 0, 2)} / {numeralNumber(memoVolume, 2)}
        </span>
      </DataAtom>
    ),
    [t, data, memoVolume]
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
    let liqPrice
    if (variablesLoaded) {
      const { marginBalance = 0, totalPositionAmount = 0 } = variables
      const mul = data.side === PositionSideTypes.short ? -1 : 1

      const p1 = bnMul(totalPositionAmount, clearingParams.marginMaintenanceRatio)
      const p2 = bnMinus(marginBalance, p1)
      const p3 = bnDiv(p2, data.size)
      const p4 = bnMul(p3, mul)
      const p5 = bnMinus(spotPrice, p4)
      liqPrice = isLTET(p5, 0) ? '--' : keepDecimals(p5, 2)
    } else {
      liqPrice = '--'
    }

    return (
      <DataAtom
        label={t('Trade.MyPosition.LiqPrice', 'Liq. Price')}
        tip={t('Trade.MyPosition.LiqPriceTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        <span>{liqPrice}</span>
      </DataAtom>
    )
  }, [t, data, clearingParams, variables, spotPrice, variablesLoaded])

  const atom5Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.MyPosition.Margin', 'Margin')}
        tip={t('Trade.MyPosition.MarginTip')}
        footer={marginToken.symbol}
      >
        <span>{numeralNumber(memoMargin, 2)}</span>
      </DataAtom>
    )
  }, [memoMargin, t])

  const atom6Tsx = useMemo(() => {
    let alertLevel = 0
    if (isGT(variables.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 5))) alertLevel = 0
    else if (isGT(variables.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 4))) alertLevel = 1
    else if (isGT(variables.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 3))) alertLevel = 2
    else if (isGT(variables.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 2))) alertLevel = 3
    else if (isGT(variables.marginRate, clearingParams.marginMaintenanceRatio)) alertLevel = 4
    else alertLevel = 5

    return (
      <DataAtom
        hover
        label={t('Trade.MyPosition.MarginRate', 'Margin Rate')}
        tip={t('Trade.MyPosition.MarginRateTip', { Ratio: bnMul(clearingParams.marginMaintenanceRatio, 100) })}
      >
        <span className={classNames('reminder', `${Number(variables.marginRate) >= 0 ? 'up' : 'down'}`)}>
          {riseOrFall(variables.marginRate as any)}
          {keepDecimals(Number(variables.marginRate) * 100, 2)}%
        </span>
        <Reminder alertLevel={alertLevel} />
      </DataAtom>
    )
  }, [t, variables.marginRate, clearingParams.marginMaintenanceRatio])

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
          symbol={data?.derivative}
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
