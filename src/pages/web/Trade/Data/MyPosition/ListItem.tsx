import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import PubSub from 'pubsub-js'
import { useSigner } from 'wagmi'

import React, { FC, useMemo, useState, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import { userBrokerBoundAtom } from '@/atoms/useBrokerData'
import { traderVariablesAtom } from '@/atoms/useTraderVariables'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useClearingParams } from '@/hooks/useClearingParams'
import { usePositionOperation } from '@/hooks/usePositionOperation'
import { useTokenSpotPrice } from '@/hooks/useTokenSpotPrices'
import PreviewDialog from '@/pages/web/Trade/Dialogs/PositionClose'
import ConfirmDialog from '@/pages/web/Trade/Dialogs/PositionClose/Confirm'
import PnLDialog from '@/pages/web/Trade/Dialogs/TakeProfitAndStopLoss'
import {
  useMarginTokenStore,
  usePositionOperationStore,
  useProtocolConfigStore,
  useTokenSpotPricesStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { PositionSideTypes, PubSubEvents, Rec } from '@/typings'
import emitter, { EventTypes } from '@/utils/emitter'
import {
  bnDiv,
  bnMinus,
  bnMul,
  formatUnits,
  isGT,
  isGTET,
  isLTET,
  keepDecimals,
  nonBigNumberInterception,
  numeralNumber
} from '@/utils/tools'

import AtomWrap from '../c/AtomWrap'
import DataAtom from '../c/DataAtom'
import EditButton from '../c/EditButton'
import ItemHeader from '../c/ItemHeader'
import Reminder from '../c/Reminder'

const riseOrFall = (data: string): string => (isGTET(data, 0) ? '+' : '')

const MyPositionListItem: FC<{ data: Rec }> = ({ data }) => {
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const [modalType, setModalType] = useState<string>()
  const variables = useAtomValue(traderVariablesAtom)
  const userBrokerBound = useAtomValue(userBrokerBoundAtom)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const openingParams = usePositionOperationStore((state) => state.openingParams)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPricesForPosition)
  const { clearingParams } = useClearingParams(protocolConfig?.clearing)
  const { closePosition, takeProfitOrStopLoss } = usePositionOperation()
  const { spotPrice, precision } = useTokenSpotPrice(tokenSpotPrices, data.name)

  const collateral = useMemo(() => {
    return bnDiv(bnMul(data.size, spotPrice), data.leverage)
  }, [data, spotPrice])

  const averagePrice = useMemo(() => {
    if (data.pricePrecision) return formatUnits(data.averagePrice, data.pricePrecision)
    return '0'
  }, [data])

  const volume = useMemo(() => {
    return bnMul(data.size, spotPrice)
  }, [data, spotPrice])

  const pnl = useMemo(() => {
    if (isGT(spotPrice, 0) && isGT(data.size, 0) && isGT(averagePrice, 0)) {
      const p1 = bnMinus(spotPrice, averagePrice)
      const p2 = bnMul(p1, data.size)
      const p3 = data.side === PositionSideTypes.long ? 1 : -1
      return bnMul(p2, p3)
    }
    return '0'
  }, [data, averagePrice, spotPrice])

  const ratio = useMemo(() => {
    return isGT(collateral, 0) ? bnDiv(pnl, collateral) : '0'
  }, [pnl, collateral])

  const atom1Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.MyPosition.UnrealizedPnL', 'Unrealized PnL')}
        tip={t('Trade.MyPosition.UnrealizedPnLTip')}
        footer={marginToken.symbol}
      >
        <span className={classNames(`${riseOrFall(pnl) ? 'up' : 'down'}`)}>
          {riseOrFall(pnl)}
          {numeralNumber(pnl, marginToken.decimals)} ({riseOrFall(ratio)}
          {numeralNumber(bnMul(ratio, 100), 2)}%)
        </span>
      </DataAtom>
    )
  }, [t, pnl, ratio, marginToken])

  const atom2Tsx = useMemo(() => {
    const output = Number(data.size) < 1 ? nonBigNumberInterception(data.size, 8) : numeralNumber(data.size, 2)
    return (
      <DataAtom
        label={t('Trade.MyPosition.Volume', 'Volume')}
        tip={t('Trade.MyPosition.VolumeTip')}
        footer={`${data.quoteToken} / ${marginToken.symbol}`}
      >
        <span>
          {output} / {numeralNumber(volume, marginToken.decimals)}
        </span>
      </DataAtom>
    )
  }, [t, data, volume, marginToken])

  const atom3Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.MyPosition.AvgPrice', 'Avg. Price')}
        tip={t('Trade.MyPosition.AvgPriceTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        <span>{keepDecimals(averagePrice, data.decimals)}</span>
      </DataAtom>
    )
  }, [t, data])

  const atom4Tsx = useMemo(() => {
    let liqPrice
    if (variables.loaded) {
      const { marginBalance = 0, totalPositionAmount = 0 } = variables.data
      const mul = data.side === PositionSideTypes.short ? -1 : 1

      const p1 = bnMul(totalPositionAmount, clearingParams.marginMaintenanceRatio)
      const p2 = bnMinus(marginBalance, p1)
      const p3 = bnDiv(p2, data.size)
      const p4 = bnMul(p3, mul)
      const p5 = bnMinus(spotPrice, p4)
      liqPrice = isLTET(p5, 0) ? '--' : keepDecimals(p5, data.decimals)
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
  }, [t, data, clearingParams, variables, spotPrice])

  const atom5Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.MyPosition.Margin', 'Margin')}
        tip={t('Trade.MyPosition.MarginTip')}
        footer={marginToken.symbol}
      >
        <span>{numeralNumber(collateral, marginToken.decimals)}</span>
      </DataAtom>
    )
  }, [marginToken, collateral, t])

  const atom6Tsx = useMemo(() => {
    let alertLevel = 0
    if (isGT(variables.data.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 5))) alertLevel = 0
    else if (isGT(variables.data.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 4))) alertLevel = 1
    else if (isGT(variables.data.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 3))) alertLevel = 2
    else if (isGT(variables.data.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 2))) alertLevel = 3
    else if (isGT(variables.data.marginRate, clearingParams.marginMaintenanceRatio)) alertLevel = 4
    else alertLevel = 5

    return (
      <DataAtom
        hover
        label={t('Trade.MyPosition.MarginRate', 'Margin Rate')}
        tip={t('Trade.MyPosition.MarginRateTip', { Ratio: bnMul(clearingParams.marginMaintenanceRatio, 100) })}
      >
        <span className={classNames('reminder', `${Number(variables.data.marginRate) >= 0 ? 'up' : 'down'}`)}>
          {riseOrFall(variables.data.marginRate)}
          {numeralNumber(Number(variables.data.marginRate) * 100, 2)}%
        </span>
        <Reminder alertLevel={alertLevel} />
      </DataAtom>
    )
  }, [t, variables, clearingParams.marginMaintenanceRatio])

  const atom7Tsx = useMemo(() => {
    const price =
      data?.takeProfitPrice !== '--'
        ? keepDecimals(formatUnits(data.takeProfitPrice, data.pricePrecision), data.decimals)
        : '--'
    return (
      <DataAtom
        label={t('Trade.MyPosition.TakeProfit', 'Take Profit')}
        tip={t('Trade.MyPosition.TakeProfitTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        {price} <EditButton onClick={() => setModalType('PNL_POSITION')} />
      </DataAtom>
    )
  }, [t, data])

  const atom8Tsx = useMemo(() => {
    const price =
      data?.stopLossPrice !== '--'
        ? keepDecimals(formatUnits(data.stopLossPrice, data.pricePrecision), data.decimals)
        : '--'
    return (
      <DataAtom
        label={t('Trade.MyPosition.StopLoss', 'Stop Loss')}
        tip={t('Trade.MyPosition.StopLossTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        {price} <EditButton onClick={() => setModalType('PNL_POSITION')} />
      </DataAtom>
    )
  }, [t, data])

  const disabled = useMemo(
    () => !signer || !userBrokerBound?.broker || !protocolConfig,
    [signer, protocolConfig, userBrokerBound]
  )

  const isFullSize = useCallback(
    ({ size = 0 }, amount: string): boolean => {
      const _ = nonBigNumberInterception(bnMul(spotPrice, size), marginToken.decimals)
      return isGTET(amount, _)
    },
    [spotPrice, marginToken]
  )

  const closePositionFunc = async () => {
    setModalType('')
    const toast = window.toast.loading(t('common.pending'))
    if (!signer || !userBrokerBound?.broker || !protocolConfig) return window.toast.error(t('common.failed'))
    const { side, size, token } = data
    const { broker } = userBrokerBound
    const { exchange } = protocolConfig
    const status = await closePosition(
      exchange,
      broker,
      spotPrice,
      token,
      openingParams.closingAmount,
      size,
      side,
      isFullSize(data, openingParams.closingAmount)
    )
    if (status) {
      window.toast.success(t('common.success'))
      PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
      PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
      emitter.emit(EventTypes.updateTraderVariables)
    } else {
      window.toast.error(t('common.failed'))
    }
    window.toast.dismiss(toast)
  }

  const createPnLOrderFunc = async (params: Record<string, any>) => {
    setModalType('')
    const toast = window.toast.loading(t('common.pending'))
    if (!signer) return window.toast.error(t('common.failed'))
    const { side, TP, SL } = params
    const status = await takeProfitOrStopLoss(data.pairAddress, side, TP, SL, precision)
    if (status) {
      window.toast.success(t('common.success'))
      PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
    } else {
      window.toast.error(t('common.failed'))
    }
    window.toast.dismiss(toast)
  }

  return (
    <>
      <div className="web-trade-data-item">
        <ItemHeader
          symbol={data?.name}
          multiple={data?.leverage}
          direction={PositionSideTypes[data?.side] as any}
          buttonText={Number(spotPrice) ? t('Trade.MyPosition.Close', 'Close') : ''}
          onButtonClick={() => setModalType('PREVIEW_POSITION')}
        />
        {isMobile ? (
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
      <PreviewDialog
        data={{ ...data, spotPrice: spotPrice }}
        visible={modalType === 'PREVIEW_POSITION'}
        onClose={() => setModalType('')}
        onClick={() => setModalType('CONFIRM_POSITION')}
      />
      <ConfirmDialog
        data={{ ...data, spotPrice: spotPrice }}
        visible={modalType === 'CONFIRM_POSITION'}
        onClose={() => setModalType('')}
        onClick={closePositionFunc}
        disabled={disabled}
      />
      <PnLDialog
        data={{ ...data, spotPrice: spotPrice }}
        visible={modalType === 'PNL_POSITION'}
        onClose={() => setModalType('')}
        onClick={createPnLOrderFunc}
      />
    </>
  )
}

export default MyPositionListItem
